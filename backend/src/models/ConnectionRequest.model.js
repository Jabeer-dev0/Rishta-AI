const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending',
  },
  message: { type: String, trim: true, maxlength: 300 },
}, { timestamps: true });

// Prevent duplicate requests
connectionRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
connectionRequestSchema.index({ toUser: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
