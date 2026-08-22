const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');
const { createNotification } = require('../services/notification.service');

// Map: userId -> socketId
const onlineUsers = new Map();

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    },
  });

  // ── Auth middleware for socket ──────────────────────────
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    // Check for cookie if no token in auth/headers
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.token;
    }

    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: user=${userId} socket=${socket.id}`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    io.emit('chat:online-status', { userId, isOnline: true });

    // Join personal notifications room
    socket.join(`user:${userId}`);

    // ── Join conversation room ────────────────────────────
    socket.on('chat:join', async ({ conversationId }) => {
      try {
        const conv = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });
        if (!conv) return socket.emit('error', { message: 'Conversation not found or access denied' });
        socket.join(`conv:${conversationId}`);
        console.log(`📬 User ${userId} joined conv:${conversationId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Send message ─────────────────────────────────────
    socket.on('chat:send-message', async ({ conversationId, text, mediaType = 'text', mediaUrl }) => {
      try {
        const conv = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
          isActive: true,
        }).populate('participants', 'name profilePhoto');

        if (!conv) return socket.emit('error', { message: 'Conversation not found or inactive' });

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text,
          mediaType,
          mediaUrl,
          deliveredTo: [userId],
          seenBy: [userId],
        });

        // Update conversation last message
        const recipientId = conv.participants.find(p => p._id.toString() !== userId)._id;

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text || `[${mediaType}]`,
          lastMessageTime: new Date(),
          lastMessageBy: userId,
          $inc: { [`unreadCount.${recipientId}`]: 1 },
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name profilePhoto verified');

        // Broadcast to conversation room
        io.to(`conv:${conversationId}`).emit('chat:new-message', populated);

        // Notify recipient if offline
        await createNotification({
          recipient: recipientId,
          type: 'new_message',
          title: 'New Message',
          body: `You have a new message`,
          data: { conversationId },
          io,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Typing indicator ─────────────────────────────────
    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('chat:typing', { userId, isTyping });
    });

    // ── Mark as read ─────────────────────────────────────
    socket.on('chat:read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId } },
          { $addToSet: { seenBy: userId } }
        );
        await Conversation.findByIdAndUpdate(conversationId, {
          [`unreadCount.${userId}`]: 0,
        });
        socket.to(`conv:${conversationId}`).emit('chat:message-seen', { conversationId, seenBy: userId });
      } catch (err) {
        console.error('chat:read error', err.message);
      }
    });

    // ── Disconnect ───────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('chat:online-status', { userId, isOnline: false });
      console.log(`🔌 Socket disconnected: user=${userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const isUserOnline = (userId) => onlineUsers.has(userId.toString());

module.exports = { initSocket, getIO, isUserOnline };
