const ConnectionRequest = require('../models/ConnectionRequest.model');
const Conversation = require('../models/Conversation.model');
const { createNotification } = require('../services/notification.service');
const { getIO } = require('../config/socket');
const { success, error } = require('../utils/response.utils');

// POST /api/connections/send/:targetUserId
const sendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const fromUser = req.user._id;

    if (fromUser.toString() === targetUserId) return error(res, "You can't send a request to yourself.", 400);

    // Check for existing pending request
    const existing = await ConnectionRequest.findOne({
      $or: [
        { fromUser, toUser: targetUserId },
        { fromUser: targetUserId, toUser: fromUser },
      ],
      status: 'pending',
    });
    if (existing) return error(res, 'A request already exists between you and this user.', 409);

    const request = await ConnectionRequest.create({
      fromUser,
      toUser: targetUserId,
      message: req.body.message,
    });

    // Notify target user
    await createNotification({
      recipient: targetUserId,
      type: 'connection_request',
      title: 'New Connection Request',
      body: `${req.user.name} wants to connect with you!`,
      data: { requestId: request._id.toString(), userId: fromUser.toString() },
    });

    // Real-time Socket.io event
    getIO().to(targetUserId.toString()).emit('connection:new-request', {
      request,
      fromUser: { _id: req.user._id, name: req.user.name, city: req.user.city },
    });

    return success(res, { data: { request } }, 'Connection request sent!', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/connections/accept/:requestId
const acceptRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findOne({
      _id: req.params.requestId,
      toUser: req.user._id,
      status: 'pending',
    });
    if (!request) return error(res, 'Request not found.', 404);

    request.status = 'accepted';
    request.updatedAt = new Date();
    await request.save();

    // Create conversation
    const conversation = await Conversation.create({
      participants: [request.fromUser, request.toUser],
      connectionRequest: request._id,
    });

    // Notify requester
    await createNotification({
      recipient: request.fromUser,
      type: 'request_accepted',
      title: 'Connection Accepted! 🎉',
      body: `${req.user.name} accepted your connection request. You can now chat!`,
      data: { conversationId: conversation._id.toString() },
    });

    // Socket.io — notify both users
    const io = getIO();
    io.to(request.fromUser.toString()).emit('connection:accepted', { conversation, acceptedBy: req.user._id });
    io.to(request.toUser.toString()).emit('connection:accepted', { conversation, acceptedBy: req.user._id });

    await request.populate(['fromUser', 'toUser'], 'name city profilePhoto');
    return success(res, { data: { request, conversation } }, 'Connection accepted! 💍');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/connections/decline/:requestId
const declineRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findOneAndUpdate(
      { _id: req.params.requestId, toUser: req.user._id, status: 'pending' },
      { status: 'declined', updatedAt: new Date() },
      { new: true }
    );
    if (!request) return error(res, 'Request not found.', 404);
    return success(res, { data: { request } }, 'Request declined');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/connections/cancel/:requestId
const cancelRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findOneAndUpdate(
      { _id: req.params.requestId, fromUser: req.user._id, status: 'pending' },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );
    if (!request) return error(res, 'Request not found.', 404);
    return success(res, { data: { request } }, 'Request cancelled');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/connections/received
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ toUser: req.user._id, status: 'pending' })
      .populate('fromUser', 'name age city profession profilePhoto verified')
      .sort({ createdAt: -1 });
    return success(res, { data: { requests } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/connections/sent
const getSentRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ fromUser: req.user._id })
      .populate('toUser', 'name age city profession profilePhoto verified')
      .sort({ createdAt: -1 });
    return success(res, { data: { requests } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/connections/unmatch/:conversationId
const unmatch = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });
    if (!conversation) return error(res, 'Conversation not found.', 404);

    conversation.isActive = false;
    await conversation.save();
    return success(res, {}, 'Unmatched successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { sendRequest, acceptRequest, declineRequest, cancelRequest, getReceivedRequests, getSentRequests, unmatch };
