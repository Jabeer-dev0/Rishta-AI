const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const { createNotification } = require('../services/notification.service');
const { getIO } = require('../config/socket');
const { success, error } = require('../utils/response.utils');

// GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'name profilePhoto city lastActiveAt')
      .sort({ lastMessageTime: -1 });

    // Add unread count for current user
    const enriched = conversations.map(c => {
      const other = c.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unread = c.unreadCount?.get(req.user._id.toString()) || 0;
      return { ...c.toObject(), otherUser: other, unreadCount: unread };
    });

    return success(res, { data: { conversations: enriched } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/chat/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });
    if (!conversation) return error(res, 'Conversation not found.', 404);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: req.params.id, isDeleted: false })
        .populate('sender', 'name profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: req.params.id, isDeleted: false }),
    ]);

    return success(res, {
      data: {
        messages: messages.reverse(),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/chat/conversations/:id/read
const markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, participants: req.user._id });
    if (!conversation) return error(res, 'Conversation not found.', 404);

    await Message.updateMany(
      { conversation: req.params.id, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    conversation.unreadCount?.set(req.user._id.toString(), 0);
    await conversation.save();

    return success(res, {}, 'Messages marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/chat/conversations/:id
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    }).populate('participants', 'name profilePhoto city lastActiveAt');
    if (!conversation) return error(res, 'Conversation not found.', 404);
    return success(res, { data: { conversation } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getConversations, getMessages, markAsRead, getConversation };
