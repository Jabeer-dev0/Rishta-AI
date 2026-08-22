const Report = require('../models/Report.model');
const User = require('../models/User.model');
const { success, error } = require('../utils/response.utils');

// POST /api/reports
const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    if (!reportedUserId || !reason) return error(res, 'reportedUserId and reason are required.', 400);
    if (reportedUserId === req.user._id.toString()) return error(res, "You can't report yourself.", 400);

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser: reportedUserId,
      reason,
      description,
    });
    return success(res, { data: { report } }, 'Report submitted. Our team will review it.', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/reports/block/:userId
const blockUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user.blockedUsers) user.blockedUsers = [];
    if (!user.blockedUsers.includes(req.params.userId)) {
      user.blockedUsers.push(req.params.userId);
      await user.save({ validateBeforeSave: false });
    }
    return success(res, {}, 'User blocked');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/reports/unblock/:userId
const unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: req.params.userId } });
    return success(res, {}, 'User unblocked');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/reports/blocked-users
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'name profilePhoto city');
    return success(res, { data: { blockedUsers: user.blockedUsers || [] } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { reportUser, blockUser, unblockUser, getBlockedUsers };
