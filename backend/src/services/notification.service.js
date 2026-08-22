const Notification = require('../models/Notification.model');

/**
 * Creates a notification and emits it via Socket.io
 * @param {Object} opts
 * @param {string}  opts.recipient   - User ObjectId
 * @param {string}  opts.type        - Notification type enum
 * @param {string}  opts.title
 * @param {string}  opts.body
 * @param {Object}  [opts.data]      - Extra metadata map
 * @param {Object}  [opts.io]        - Socket.io instance
 */
const createNotification = async ({ recipient, type, title, body, data = {}, io }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      body,
      data,
    });

    // Emit real-time if socket instance provided
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification:new', notification);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err.message);
  }
};

module.exports = { createNotification };
