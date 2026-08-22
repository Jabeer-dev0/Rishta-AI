const User = require('../models/User.model');
const Report = require('../models/Report.model');
const Match = require('../models/Match.model');
const { success, error } = require('../utils/response.utils');

// GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, verificationStatus, isBlocked } = req.query;
    const clauses = [];
    const params = [];
    if (search) {
      clauses.push('(name LIKE ? OR email LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like);
    }
    if (verificationStatus) { clauses.push('verification_status = ?'); params.push(verificationStatus); }
    if (isBlocked !== undefined) { clauses.push('is_blocked = ?'); params.push(isBlocked === 'true' ? 1 : 0); }

    const where = clauses.length ? clauses.join(' AND ') : '1=1';
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rows, total] = await Promise.all([
      User.queryRows(
        `SELECT * FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), skip]
      ),
      User.countRows(where, params),
    ]);
    const users = rows.map(User.mapUser).map(User.stripSensitive);
    return success(res, { data: { users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/block
const blockUser = async (req, res) => {
  try {
    const user = await User.updateById(req.params.id, { isBlocked: true });
    if (!user) return error(res, 'User not found.', 404);
    return success(res, {}, 'User blocked');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/unblock
const unblockUser = async (req, res) => {
  try {
    await User.updateById(req.params.id, { isBlocked: false });
    return success(res, {}, 'User unblocked');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/verify
const manualVerify = async (req, res) => {
  try {
    await User.updateById(req.params.id, { verified: true, verificationStatus: 'verified' });
    return success(res, {}, 'User manually verified');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await Match.deleteByUserOrMatched(userId);
    await User.deleteById(userId);
    return success(res, {}, 'User and associated matches deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.listOpen();
    return success(res, { data: { reports } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// PUT /api/admin/reports/:id/resolve
const resolveReport = async (req, res) => {
  try {
    await Report.updateById(req.params.id, { status: 'resolved' });
    return success(res, {}, 'Report resolved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, blockedUsers, totalMatches, pendingVerifications] = await Promise.all([
      User.countRows("role = 'user'"),
      User.countRows('verified = 1'),
      User.countRows('is_blocked = 1'),
      Match.countAll(),
      User.countRows("verification_status = 'pending'"),
    ]);
    return success(res, {
      data: { totalUsers, verifiedUsers, blockedUsers, totalMatches, pendingVerifications }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { listUsers, blockUser, unblockUser, manualVerify, deleteUser, getReports, resolveReport, getStats };
