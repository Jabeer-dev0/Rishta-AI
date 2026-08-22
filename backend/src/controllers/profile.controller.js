const User = require('../models/User.model');
const { success, error } = require('../utils/response.utils');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  return success(res, { data: { user: req.user.toPublicProfile() } });
};

// PUT /api/profile/me
const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'age', 'city', 'religion', 'education', 'profession',
      'bio', 'interests', 'familyBackground', 'partnerPreferences',
    ];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.interests && typeof updates.interests === 'string') {
      updates.interests = updates.interests.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Recalculate profileCompletion
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    user.profileCompletion = user.calculateCompletion();
    await user.save({ validateBeforeSave: false });

    return success(res, { data: { user: user.toPublicProfile() } }, 'Profile updated successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/profile/:userId
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.isActive) return error(res, 'User not found.', 404);

    // Increment profile views
    await User.findByIdAndUpdate(req.params.userId, { $inc: { profileViews: 1 } });

    const { attachConnectionStatus } = require('../utils/connection.utils');
    const [userWithStatus] = await attachConnectionStatus([user], req.user._id);

    return success(res, { data: { user: userWithStatus } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/profile/me/photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No file uploaded.', 400);
    
    const result = await uploadToCloudinary(req.file.buffer);
    const user = await User.findById(req.user._id);
    
    if (!user.photos) user.photos = [];
    user.photos.push(result.secure_url);
    // Set as primary profile photo
    user.profilePhoto = result.secure_url;
    
    await user.save({ validateBeforeSave: false });
    
    return success(res, { data: { photos: user.photos, profilePhoto: user.profilePhoto } }, 'Profile photo updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/profile/me/photo/:index
const deletePhoto = async (req, res) => {
  try {
    const user = req.user;
    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= user.photos.length) return error(res, 'Invalid photo index.', 400);
    user.photos.splice(idx, 1);
    if (user.profilePhoto === user.photos[idx]) user.profilePhoto = user.photos[0] || null;
    await user.save({ validateBeforeSave: false });
    return success(res, { data: { photos: user.photos } }, 'Photo deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/profile/me/preferences
const updatePreferences = async (req, res) => {
  try {
    req.user.partnerPreferences = { ...req.user.partnerPreferences.toObject(), ...req.body };
    await req.user.save({ validateBeforeSave: false });
    return success(res, { data: { partnerPreferences: req.user.partnerPreferences } }, 'Preferences updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/profile/me/stats
const getStats = async (req, res) => {
  try {
    const user = req.user;
    const Match = require('../models/Match.model');
    const ConnectionRequest = require('../models/ConnectionRequest.model');
    const Conversation = require('../models/Conversation.model');

    const [matchCount, pendingRequests, conversations] = await Promise.all([
      Match.countDocuments({ user: user._id }),
      ConnectionRequest.countDocuments({ toUser: user._id, status: 'pending' }),
      Conversation.countDocuments({ participants: user._id }),
    ]);

    return success(res, {
      data: {
        profileViews: user.profileViews,
        aiMatches: matchCount,
        messages: conversations,
        pendingRequests,
        profileCompletion: user.profileCompletion,
        aiScore: user.aiScore || 0,
      }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/profile/me/notifications
const updateNotifications = async (req, res) => {
  try {
    req.user.notificationPrefs = { ...req.user.notificationPrefs.toObject(), ...req.body };
    await req.user.save({ validateBeforeSave: false });
    return success(res, { data: { notificationPrefs: req.user.notificationPrefs } }, 'Preferences saved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/profile/me
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.clearCookie('refreshToken');
    return success(res, {}, 'Account deleted. We hope to see you again someday 💔');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  getMyProfile, updateMyProfile, getProfile, uploadPhoto, deletePhoto,
  updatePreferences, getStats, updateNotifications, deleteAccount,
};
