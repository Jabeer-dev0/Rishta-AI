const User = require('../models/User.model');
const Report = require('../models/Report.model');
const Match = require('../models/Match.model');
const { success, error } = require('../utils/response.utils');

// GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, verificationStatus, isBlocked } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    return success(res, { data: { users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/block
const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    if (!user) return error(res, 'User not found.', 404);
    return success(res, {}, 'User blocked');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/unblock
const unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    return success(res, {}, 'User unblocked');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/verify
const manualVerify = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { verified: true, verificationStatus: 'verified' });
    return success(res, {}, 'User manually verified');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await Promise.all([
      User.findByIdAndDelete(userId),
      Match.deleteMany({ $or: [{ user: userId }, { matchedUser: userId }] })
    ]);
    return success(res, {}, 'User and associated matches deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'open' })
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 });
    return success(res, { data: { reports } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/reports/:id/resolve
const resolveReport = async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    return success(res, {}, 'Report resolved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, blockedUsers, totalMatches, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ verified: true }),
      User.countDocuments({ isBlocked: true }),
      Match.countDocuments(),
      User.countDocuments({ verificationStatus: 'pending' }),
    ]);
    return success(res, { 
      data: { totalUsers, verifiedUsers, blockedUsers, totalMatches, pendingVerifications } 
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { listUsers, blockUser, unblockUser, manualVerify, deleteUser, getReports, resolveReport, getStats };
