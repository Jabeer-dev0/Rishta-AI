const crypto = require('crypto');
const User = require('../models/User.model');
const { sendTokens, verifyRefreshToken, generateAccessToken } = require('../utils/jwt.utils');
const { success, error } = require('../utils/response.utils');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');
const { extractCnicData, isValidCnicFormat, compareNames, compareDates } = require('../services/cnic.service');
const { compareFaces } = require('../services/faceMatch.service');

const { uploadPhotoToCloudinary, uploadCnicToCloudinary } = require('../middleware/upload.middleware');

/** Required text fields for signup — account will NOT be created without them. */
const REQUIRED_FIELDS = ['name', 'email', 'password', 'dateOfBirth', 'gender', 'religion', 'city', 'education', 'profession'];

// POST /api/auth/register  (multipart with profilePhoto, cnicFront, cnicBack, selfie)
const register = async (req, res) => {
  try {
    const { email, password, name, dateOfBirth, age, gender, religion, city, country,
      education, profession, interests, familyBackground, bio, cnic } = req.body;

    // ─── 1. Required field validation ───
    const missing = REQUIRED_FIELDS.filter((f) => !req.body[f] || !String(req.body[f]).trim());
    if (missing.length > 0) {
      return error(res, `Yeh fields zaroori hain: ${missing.join(', ')}`, 400);
    }

    if (String(password).length < 6) {
      return error(res, 'Password kam az kam 6 characters ka hona chahiye.', 400);
    }
    if (!req.files?.profilePhoto?.[0] || !req.files?.cnicFront?.[0] || !req.files?.cnicBack?.[0] || !req.files?.selfie?.[0]) {
      return error(res, 'Profile photo, CNIC front/back aur selfie — chaar images zaroori hain.', 400);
    }
    // Age derived from DOB — 18+ mandatory
    const dobDate = new Date(dateOfBirth);
    const calcAge = Math.floor((Date.now() - dobDate.getTime()) / 31557600000);
    if (isNaN(dobDate.getTime()) || calcAge < 18) {
      return error(res, 'Registration ke liye umar kam az kam 18 saal honi chahiye (valid DOB dein).', 400);
    }

    // ─── 2. Email uniqueness ───
    if (await User.findByEmail(email)) {
      return error(res, 'Email already registered.', 409);
    }

    // ─── 3. CNIC format + uniqueness ───
    if (!cnic) {
      return error(res, 'CNIC number zaroori hai (e.g. 35201-1234567-1).', 400);
    }
    const normalizedCnic = User.normalizeCnic(cnic);
    if (!isValidCnicFormat(normalizedCnic)) {
      return error(res, 'CNIC number 13 digits ka hona chahiye (e.g. 35201-1234567-1).', 400);
    }
    const cnicOwner = await User.findByCnic(normalizedCnic);
    if (cnicOwner) {
      return error(res, 'Ye CNIC pehle se kisi aur account par registered hai. Har shakhs sirf aik account bana sakta hai.', 409);
    }

    const frontFile = req.files.cnicFront[0];
    const backFile = req.files.cnicBack[0];
    const selfieFile = req.files.selfie[0];
    const photoFile = req.files.profilePhoto[0];

    // ─── 4. Upload images to R2 ───
    const [photoUpload, frontUpload, backUpload, selfieUpload] = await Promise.all([
      uploadPhotoToCloudinary(photoFile.buffer, photoFile.mimetype),
      uploadCnicToCloudinary(frontFile.buffer, frontFile.mimetype),
      uploadCnicToCloudinary(backFile.buffer, backFile.mimetype),
      uploadPhotoToCloudinary(selfieFile.buffer, selfieFile.mimetype),
    ]);

    // ─── 5. AI reads CNIC card data ───
    let extracted;
    try {
      extracted = await extractCnicData(frontFile.buffer.toString('base64'), frontFile.mimetype);
    } catch (aiErr) {
      console.error('[Register] CNIC AI extraction failed:', aiErr.message);
      return error(res, 'CNIC parha nahi ja saka. Behtar roshni mein saaf photo bhejein.', 422);
    }

    if (!isValidCnicFormat(extracted.cnicNumber)) {
      return error(res, `Card par CNIC number theek se parha nahi ja saka ("${extracted.cnicNumber}"). Saaf photo bhejein.`, 422);
    }
    // Card number must match the number user typed
    if (extracted.cnicNumber !== normalizedCnic) {
      return error(res, `CNIC number aapke diye hue number (${cnic}) se match nahi karta. Card par "${extracted.cnicNumber}" parha gaya.`, 422);
    }

    // Re-check uniqueness with the ACTUAL card number
    const realOwner = await User.findByCnic(extracted.cnicNumber);
    if (realOwner) {
      return error(res, 'Ye CNIC pehle se kisi aur account par registered hai. Har shakhs sirf aik account bana sakta hai.', 409);
    }

    // ─── 6. Card data must match profile data ───
    const mismatches = [];
    if (compareNames(extracted.name, name) < 0.6) {
      mismatches.push(`Naam match nahi hua (card par: "${extracted.name}", form mein: "${name}").`);
    }
    if (!compareDates(extracted.dateOfBirth, dateOfBirth)) {
      mismatches.push(`Tareekh-e-paidaish match nahi hui (card par: ${extracted.dateOfBirth || '?'}, form mein: ${dateOfBirth}).`);
    }
    if (extracted.gender && gender && extracted.gender.toLowerCase() !== String(gender).toLowerCase()) {
      mismatches.push('Gender CNIC ke mutabiq nahi hai.');
    }
    if (mismatches.length > 0) {
      return error(res, `CNIC data aapke form se match nahi hua. ${mismatches.join(' ')}`, 422);
    }

    // ─── 7. Face verification: CNIC card photo vs live selfie ───
    const faceResult = await compareFaces(
      { base64: frontFile.buffer.toString('base64'), mimeType: frontFile.mimetype },
      { base64: selfieFile.buffer.toString('base64'), mimeType: selfieFile.mimetype }
    );
    if (!faceResult.verified) {
      console.warn('[Register] Face verification failed:', faceResult.message, faceResult.similarity);
      return error(res, `Face verification fail ho gayi: ${faceResult.message} Selfie aur CNIC wale shakhs aik hi hone chahiye.`, 422);
    }

    // ─── 8. Create verified account ───
    const hashed = await User.hashPassword(password);
    const user = await User.create({
      email, password: hashed, name, dateOfBirth, age, gender, religion, city, country,
      education, profession,
      interests: Array.isArray(interests) ? interests : (interests || '').split(',').map(s => s.trim()).filter(Boolean),
      familyBackground, bio,
      profilePhoto: photoUpload.secure_url,
      selfieImageUrl: selfieUpload.secure_url,
      cnicNumber: extracted.cnicNumber,
      cnicImageUrl: frontUpload.secure_url,
      cnicFrontUrl: frontUpload.secure_url,
      cnicBackUrl: backUpload.secure_url,
      cnicVerified: true,
      verified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      profileCompletion: 70,
    });

    const { accessToken } = sendTokens(res, user._id);
    sendWelcomeEmail(user).catch(() => { });

    return success(res, {
      data: { user: user.toPublicProfile(), accessToken },
    }, 'Account created & identity verified! 🎉', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required.');

    const user = await User.findByEmail(email);

    if (!user) {
      return error(res, 'This email is not registered with Rishtaai.', 401);
    }

    if (!(await User.comparePassword(password, user.password))) {
      return error(res, 'Incorrect password. Please try again.', 401);
    }
    if (!user.isActive || user.isBlocked) {
      return error(res, 'Your account has been suspended.', 403);
    }

    await User.updateById(user._id, { lastActiveAt: new Date() });

    const { accessToken } = sendTokens(res, user._id);
    return success(res, { data: { user: user.toPublicProfile(), accessToken } }, 'Login successful');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  return success(res, {}, 'Logged out successfully');
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return success(res, { data: { user: req.user.toPublicProfile() } });
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return error(res, 'No refresh token.', 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return error(res, 'User not found.', 401);

    // Re-issue BOTH httpOnly cookies (access token was likely expired)
    const { accessToken } = sendTokens(res, user._id);
    await User.updateById(user._id, { lastActiveAt: new Date() });
    return success(res, { data: { accessToken, user: user.toPublicProfile() } }, 'Token refreshed');
  } catch {
    return error(res, 'Invalid or expired refresh token.', 401);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) return success(res, {}, 'If that email exists, a reset link has been sent.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    await User.updateById(user._id, {
      passwordResetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
      passwordResetExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user, resetUrl);

    return success(res, {}, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findByResetToken(hashedToken);
    if (!user) return error(res, 'Invalid or expired reset token.', 400);

    await User.updateById(user._id, {
      password: await User.hashPassword(req.body.password),
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    const { accessToken } = sendTokens(res, user._id);
    return success(res, { data: { accessToken } }, 'Password reset successful');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { register, login, logout, getMe, refreshToken, forgotPassword, resetPassword };
