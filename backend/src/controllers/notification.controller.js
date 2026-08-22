const Notification = require('../models/Notification.model');
const { success, error } = require('../utils/response.utils');

// GET /api/notifications
const getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return success(res, { data: { notifications } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return success(res, {}, 'Marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return success(res, {}, 'All notifications marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/notifications/:id
const deleteOne = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    return success(res, {}, 'Notification deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    return success(res, { data: { count } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getAll, markRead, markAllRead, deleteOne, getUnreadCount };
