const User = require('../models/User.model');
const Match = require('../models/Match.model');
const ConnectionRequest = require('../models/ConnectionRequest.model');
const Conversation = require('../models/Conversation.model');
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

    let user = await User.updateById(req.user._id, updates);
    const completion = User.calculateProfileCompletion(user);
    if (completion !== user.profileCompletion) {
      user = await User.updateById(req.user._id, { profileCompletion: completion });
    }

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
    await User.incrementField(req.params.userId, 'profileViews', 1);

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
    const user = req.user;

    const photos = [...(user.photos || []), result.secure_url];
    const updated = await User.updateById(user._id, {
      photos,
      profilePhoto: result.secure_url,
    });

    return success(res, { data: { photos: updated.photos, profilePhoto: updated.profilePhoto } }, 'Profile photo updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/profile/me/photo/:index
const deletePhoto = async (req, res) => {
  try {
    const user = req.user;
    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= (user.photos || []).length) return error(res, 'Invalid photo index.', 400);

    const photos = [...user.photos];
    photos.splice(idx, 1);
    const updates = { photos };
    if (user.profilePhoto && !photos.includes(user.profilePhoto)) {
      updates.profilePhoto = photos[0] || null;
    }
    const updated = await User.updateById(user._id, updates);
    return success(res, { data: { photos: updated.photos } }, 'Photo deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/profile/me/preferences
const updatePreferences = async (req, res) => {
  try {
    const merged = { ...(req.user.partnerPreferences || {}), ...req.body };
    await User.updateById(req.user._id, { partnerPreferences: merged });
    return success(res, { data: { partnerPreferences: merged } }, 'Preferences updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/profile/me/stats
const getStats = async (req, res) => {
  try {
    const user = req.user;

    const [matchCount, pendingRequests, conversations] = await Promise.all([
      Match.countForUser(user._id),
      ConnectionRequest.countPendingFor(user._id),
      Conversation.countForParticipant(user._id),
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
    const merged = { ...(req.user.notificationPrefs || {}), ...req.body };
    await User.updateById(req.user._id, { notificationPrefs: merged });
    return success(res, { data: { notificationPrefs: merged } }, 'Preferences saved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/profile/me
const deleteAccount = async (req, res) => {
  try {
    await User.updateById(req.user._id, { isActive: false });
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
