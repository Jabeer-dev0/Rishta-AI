const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const { success, error } = require('../utils/response.utils');

// GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.listForUser(req.user._id);

    // Add unread count for current user
    const enriched = conversations.map(c => {
      const other = c.participants[0];
      const unread = c.unreadCount?.[req.user._id] || 0;
      return { ...c, otherUser: other, unreadCount: unread };
    });

    return success(res, { data: { conversations: enriched } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/chat/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdIfParticipant(req.params.id, req.user._id);
    if (!conversation) return error(res, 'Conversation not found.', 404);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const { messages, total } = await Message.listForConversation(req.params.id, { page, limit });

    return success(res, {
      data: {
        messages,
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
    const conversation = await Conversation.findByIdIfParticipant(req.params.id, req.user._id);
    if (!conversation) return error(res, 'Conversation not found.', 404);

    await Message.markSeenInConversation(req.params.id, req.user._id);
    await Conversation.resetUnread(req.params.id, req.user._id);

    return success(res, {}, 'Messages marked as read');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/chat/conversations/:id
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdIfParticipant(req.params.id, req.user._id);
    if (!conversation) return error(res, 'Conversation not found.', 404);

    // Populate the other participant
    const populated = await Conversation.attachOtherUser(conversation, req.user._id);
    return success(res, { data: { conversation: populated } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getConversations, getMessages, markAsRead, getConversation };
