const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_match',
      'connection_request',
      'request_accepted',
      'new_message',
      'profile_view',
      'verification_complete',
      'system',
    ],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Map, of: String, default: {} },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
