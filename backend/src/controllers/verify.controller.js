const User = require('../models/User.model');
const { compareFaces } = require('../services/faceMatch.service');
const { extractCnicData, isValidCnicFormat, compareNames, compareDates } = require('../services/cnic.service');
const { createNotification } = require('../services/notification.service');
const { success, error } = require('../utils/response.utils');
const { getIO } = require('../config/socket');

const { uploadPhotoToCloudinary, uploadCnicToCloudinary } = require('../middleware/upload.middleware');

// POST /api/verify/upload-selfie
const uploadSelfie = async (req, res) => {
  try {
    if (!req.file) return error(res, 'Selfie image is required.');

    // Upload buffer to Cloudinary
    const result = await uploadPhotoToCloudinary(req.file.buffer, req.file.mimetype);

    await User.updateById(req.user._id, { selfieImageUrl: result.secure_url });

    return success(res, { data: { url: result.secure_url } }, 'Selfie uploaded successfully');
  } catch (err) {
    console.error('[UploadSelfie] Error:', err);
    return error(res, err.message, 500);
  }
};

// POST /api/verify/run-verification
const runVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.profilePhoto) return error(res, 'Please upload a profile photo first.');
    if (!user.selfieImageUrl) return error(res, 'Please take a verification selfie first.');

    const result = await compareFaces(user.profilePhoto, user.selfieImageUrl);

    if (result.verified) {
      const newCompletion = Math.min(user.profileCompletion + 15, 100);
      await User.updateById(req.user._id, {
        verified: true,
        verificationStatus: 'verified',
        profileCompletion: newCompletion,
      });

      // Send notification
      let io;
      try { io = getIO(); } catch {}
      await createNotification({
        recipient: req.user._id,
        type: 'verification_complete',
        title: 'Identity Verified! ✅',
        body: 'Your face match verification is complete. You now have a Verified badge on your profile.',
        io,
      });
    } else {
      await User.updateById(req.user._id, { verificationStatus: 'rejected' });
    }

    return success(res, {
      data: {
        verified: result.verified,
        similarity: result.similarity,
        distance: result.distance,
        status: result.verified ? 'verified' : 'rejected',
        message: result.message,
      },
    }, result.verified ? 'Verification successful!' : 'Verification failed. Please try again.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/verify/status
const getVerificationStatus = async (req, res) => {
  const user = req.user;
  return success(res, {
    data: {
      verified: user.verified,
      status: user.verificationStatus,
      cnicVerified: !!user.cnicVerified,
      cnicMasked: user.cnicNumber ? `${user.cnicNumber.slice(0, 5)}-*******-${user.cnicNumber.slice(-1)}` : null,
    },
  });
};

/** Mask a CNIC for safe display: 35201-*******-1 */
const maskCnic = (cnic) =>
  cnic && cnic.length === 13 ? `${cnic.slice(0, 5)}-*******-${cnic.slice(-1)}` : cnic;

// POST /api/verify/cnic  (multipart: cnicFront, cnicBack)
const submitCnicVerification = async (req, res) => {
  try {
    const frontFile = req.files?.cnicFront?.[0];
    const backFile = req.files?.cnicBack?.[0];
    if (!frontFile || !backFile) {
      return error(res, 'CNIC ki front aur back dono images zaroori hain (fields: cnicFront, cnicBack).', 400);
    }

    const user = await User.findById(req.user._id);
    if (user.cnicVerified) {
      return error(res, `Aapka CNIC pehle hi verify ho chuka hai (${maskCnic(user.cnicNumber)}).`, 409);
    }

    // 1. Upload both sides to R2 (private-ish folder)
    const [frontUpload, backUpload] = await Promise.all([
      uploadCnicToCloudinary(frontFile.buffer, frontFile.mimetype),
      uploadCnicToCloudinary(backFile.buffer, backFile.mimetype),
    ]);

    // 2. AI extracts data from the front image
    let extracted;
    try {
      extracted = await extractCnicData(
        frontFile.buffer.toString('base64'),
        frontFile.mimetype
      );
    } catch (aiErr) {
      console.error('[CnicVerify] AI extraction failed:', aiErr.message);
      return error(res, 'CNIC parha nahi ja saka. Behtar roshni mein saaf photo bhejein.', 422);
    }

    // 3. Validate extracted CNIC format
    if (!isValidCnicFormat(extracted.cnicNumber)) {
      await User.updateById(user._id, { verificationStatus: 'rejected', cnicImageUrl: frontUpload.secure_url });
      return error(res, `CNIC number theek se parha nahi ja saka ("${extracted.cnicNumber}"). 13-digit valid CNIC photo bhejein.`, 422);
    }

    // 4. ONE PERSON = ONE ACCOUNT — duplicate CNIC check
    const existing = await User.findByCnic(extracted.cnicNumber);
    if (existing && existing._id !== user._id) {
      console.warn(`[CnicVerify] Duplicate CNIC attempt: user ${user._id} tried CNIC already owned by ${existing._id}`);
      await User.updateById(user._id, { verificationStatus: 'rejected' });
      return error(res,
        'Ye CNIC pehle se kisi dusre account par registered hai. Har shakhs sirf aik account bana sakta hai.',
        409);
    }

    // 5. Match extracted data against profile
    const mismatches = [];
    if (compareNames(extracted.name, user.name) < 0.6) {
      mismatches.push(`Naam match nahi hua (card par: "${extracted.name}", profile par: "${user.name}").`);
    }
    if (user.dateOfBirth && !compareDates(extracted.dateOfBirth, user.dateOfBirth)) {
      mismatches.push(`Tareekh-e-paidaish match nahi hui (card par: ${extracted.dateOfBirth}, profile par: ${new Date(user.dateOfBirth).toISOString().slice(0, 10)}).`);
    }
    if (extracted.gender && user.gender &&
      extracted.gender.toLowerCase() !== String(user.gender).toLowerCase()) {
      mismatches.push('Gender card ke mutabiq nahi hai.');
    }

    if (mismatches.length > 0) {
      await User.updateById(user._id, {
        verificationStatus: 'rejected',
        cnicImageUrl: frontUpload.secure_url,
      });
      return error(res, `CNIC data aapki profile se match nahi hua. ${mismatches.join(' ')}`, 422);
    }

    // 6. Success — mark verified
    await User.updateById(user._id, {
      cnicNumber: extracted.cnicNumber,
      cnicFrontUrl: frontUpload.secure_url,
      cnicBackUrl: backUpload.secure_url,
      cnicImageUrl: frontUpload.secure_url,
      cnicVerified: true,
      verified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      profileCompletion: Math.min((user.profileCompletion || 40) + 15, 100),
    });

    let io;
    try { io = getIO(); } catch {}
    await createNotification({
      recipient: user._id,
      type: 'verification_complete',
      title: 'CNIC Verified! 🪪',
      body: 'Aapki CNIC verification kamyab ho gayi. Ab aapke profile par Verified badge hai.',
      io,
    });

    return success(res, {
      data: {
        verified: true,
        status: 'verified',
        cnicMasked: maskCnic(extracted.cnicNumber),
        matchedName: extracted.name,
      },
    }, 'CNIC verify ho gaya! Aapke profile par Verified badge lag gaya hai.');
  } catch (err) {
    console.error('[CnicVerify] Error:', err);
    return error(res, err.message, 500);
  }
};

module.exports = { uploadSelfie, runVerification, getVerificationStatus, submitCnicVerification };
