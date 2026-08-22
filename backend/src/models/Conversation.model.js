const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  connectionRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ConnectionRequest' },

  lastMessage: { type: String },
  lastMessageTime: { type: Date },
  lastMessageBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // { userId: unreadCount }
  unreadCount: { type: Map, of: Number, default: {} },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
