const ConnectionRequest = require('../models/ConnectionRequest.model');

/**
 * Attaches connection status to a list of users relative to a specific user
 * @param {Array} users - List of user objects (or match objects with matchedUser)
 * @param {String} currentUserId - The ID of the current logged-in user
 * @returns {Promise<Array>} - Users with connectionStatus field
 */
const attachConnectionStatus = async (users, currentUserId) => {
  if (!users || users.length === 0) return [];

  const userIds = [...new Set(users.map(u => (u._id ? u._id : (u.matchedUser && u.matchedUser._id) || u.matchedUser).toString()))];

  const connections = await ConnectionRequest.findBetween(currentUserId, userIds);

  const connectionMap = {};
  connections.forEach(conn => {
    const isFromMe = conn.fromUser.toString() === currentUserId.toString();
    const otherUserId = isFromMe ? conn.toUser.toString() : conn.fromUser.toString();

    // Status can be: 'pending_sent', 'pending_received', 'accepted', 'declined'
    let status = conn.status;
    if (status === 'pending') {
      status = isFromMe ? 'pending_sent' : 'pending_received';
    }

    connectionMap[otherUserId] = {
      status,
      requestId: conn._id
    };
  });

  return users.map(u => {
    const userObj = u.toPublicProfile ? u.toPublicProfile() : (u.toObject ? u.toObject() : u);
    const targetId = (userObj._id || userObj.matchedUser?._id || userObj.matchedUser)?.toString();

    return {
      ...userObj,
      connectionStatus: connectionMap[targetId]?.status || 'none',
      connectionRequestId: connectionMap[targetId]?.requestId || null
    };
  });
};

module.exports = { attachConnectionStatus };
