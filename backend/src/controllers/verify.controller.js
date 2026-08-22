const User = require('../models/User.model');
const { compareFaces } = require('../services/faceMatch.service');
const { createNotification } = require('../services/notification.service');
const { success, error } = require('../utils/response.utils');
const { getIO } = require('../config/socket');

const { uploadPhotoToCloudinary } = require('../middleware/upload.middleware');

// POST /api/verify/upload-selfie
const uploadSelfie = async (req, res) => {
  try {
    if (!req.file) return error(res, 'Selfie image is required.');

    // Upload buffer to Cloudinary
    const result = await uploadPhotoToCloudinary(req.file.buffer);

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
  return success(res, {
    data: {
      verified: req.user.verified,
      status: req.user.verificationStatus,
    },
  });
};

module.exports = { uploadSelfie, runVerification, getVerificationStatus };
