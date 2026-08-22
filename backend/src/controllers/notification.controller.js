const Notification = require('../models/Notification.model');
const { success, error } = require('../utils/response.utils');

// GET /api/notifications
const getAll = async (req, res) => {
  try {
    const notifications = await Notification.listForRecipient(req.user._id, 50);
    return success(res, { data: { notifications } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.markRead(req.params.id, req.user._id);
    return success(res, {}, 'Marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.markAllRead(req.user._id);
    return success(res, {}, 'All notifications marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE /api/notifications/:id
const deleteOne = async (req, res) => {
  try {
    await Notification.deleteOne(req.params.id, req.user._id);
    return success(res, {}, 'Notification deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countUnread(req.user._id);
    return success(res, { data: { count } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getAll, markRead, markAllRead, deleteOne, getUnreadCount };
