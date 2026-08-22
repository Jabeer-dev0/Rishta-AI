const crypto = require('crypto');
const User = require('../models/User.model');
const { sendTokens, verifyRefreshToken, generateAccessToken } = require('../utils/jwt.utils');
const { success, error } = require('../utils/response.utils');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');

const { uploadPhotoToCloudinary, uploadToCloudinary } = require('../middleware/upload.middleware');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, name, dateOfBirth, age, gender, religion, city, country,
      education, profession, interests, familyBackground, bio } = req.body;

    if (await User.findOne({ email })) {
      return error(res, 'Email already registered.', 409);
    }

    let profilePhoto = '';
    if (req.file) {
      console.log("Profile Photo:", req.file);
      const result = await uploadPhotoToCloudinary(req.file.buffer);
      console.log(result);
      profilePhoto = result.secure_url;
    }

    const user = await User.create({
      email, password, name, dateOfBirth, age, gender, religion, city, country,
      education, profession,
      interests: Array.isArray(interests) ? interests : (interests || '').split(',').map(s => s.trim()).filter(Boolean),
      familyBackground, bio,
      profilePhoto
    });

    const { accessToken } = sendTokens(res, user._id);
    sendWelcomeEmail(user).catch(() => { });

    return success(res, {
      data: { user: user.toPublicProfile(), accessToken },
    }, 'Account created successfully!', 201);
  } catch (err) {
    if (err.code === 11000) return error(res, 'Email already registered.', 409);
    return error(res, err.message, 500);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required.');

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return error(res, 'This email is not registered with Rishtaai.', 401);
    }

    if (!(await user.comparePassword(password))) {
      return error(res, 'Incorrect password. Please try again.', 401);
    }
    if (!user.isActive || user.isBlocked) {
      return error(res, 'Your account has been suspended.', 403);
    }

    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

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

    const accessToken = generateAccessToken(user._id);
    return success(res, { data: { accessToken } }, 'Token refreshed');
  } catch {
    return error(res, 'Invalid or expired refresh token.', 401);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) return success(res, {}, 'If that email exists, a reset link has been sent.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

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
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return error(res, 'Invalid or expired reset token.', 400);

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const { accessToken } = sendTokens(res, user._id);
    return success(res, { data: { accessToken } }, 'Password reset successful');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { register, login, logout, getMe, refreshToken, forgotPassword, resetPassword };
