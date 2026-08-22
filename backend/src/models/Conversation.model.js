/**
 * Conversation repository backed by Cloudflare D1.
 * The old Mongoose schema stored participants as an array;
 * here we use fixed user_a / user_b columns and store
 * unreadCount as a JSON map { userId: count }.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');
const User = require('./User.model');

const safeParse = (v, f) => {
  if (v == null) return f;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return f; }
};

const mapRow = (row) => ({
  _id: row.id,
  participants: [row.user_a, row.user_b],
  connectionRequest: row.connection_request_id,
  lastMessage: row.last_message,
  lastMessageTime: row.last_message_time,
  lastMessageBy: row.last_message_by,
  unreadCount: safeParse(row.unread_count, {}),
  isActive: !!row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const create = async ({ participants, connectionRequest }) => {
  const id = newId();
  const now = nowISO();
  const [a, b] = participants;
  await query(
    `INSERT INTO conversations (id, user_a, user_b, connection_request_id, unread_count, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, '{}', 1, ?, ?)`,
    [id, a.toString(), b.toString(), connectionRequest || null, now, now]
  );
  return findById(id);
};

const findById = async (id) => mapRow(await queryOne('SELECT * FROM conversations WHERE id = ?', [id]));

/** Conversation only if the user is a participant. */
const findByIdIfParticipant = async (id, userId, requireActive = false) => {
  const row = await queryOne(
    `SELECT * FROM conversations
     WHERE id = ? AND (user_a = ? OR user_b = ?) ${requireActive ? 'AND is_active = 1' : ''}`,
    [id, userId, userId]
  );
  return mapRow(row);
};

/** All active conversations for a user with the other participant populated. */
const listForUser = async (userId) => {
  const r = await query(
    `SELECT * FROM conversations
     WHERE is_active = 1 AND (user_a = ? OR user_b = ?)
     ORDER BY last_message_time IS NULL, last_message_time DESC`,
    [userId, userId]
  );
  const conversations = r.results.map(mapRow);
  return Promise.all(conversations.map((c) => attachOtherUser(c, userId)));
};

const OTHER_FIELDS = 'name profilePhoto city lastActiveAt';

const attachOtherUser = async (conversation, userId) => {
  const otherId = conversation.participants.find((p) => p !== userId) || conversation.participants[0];
  const other = await User.findById(otherId);
  return { ...conversation, participants: [other ? User.pickPublicFields(other, OTHER_FIELDS) : null] };
};

const updateById = async (id, fields = {}) => {
  const sets = [];
  const values = [];
  if ('lastMessage' in fields) { sets.push('last_message = ?'); values.push(fields.lastMessage); }
  if ('lastMessageTime' in fields) { sets.push('last_message_time = ?'); values.push(fields.lastMessageTime instanceof Date ? fields.lastMessageTime.toISOString() : fields.lastMessageTime); }
  if ('lastMessageBy' in fields) { sets.push('last_message_by = ?'); values.push(fields.lastMessageBy); }
  if ('isActive' in fields) { sets.push('is_active = ?'); values.push(fields.isActive ? 1 : 0); }
  if ('unreadCount' in fields) { sets.push('unread_count = ?'); values.push(JSON.stringify(fields.unreadCount || {})); }
  sets.push('updated_at = ?');
  values.push(nowISO());
  if (sets.length > 0) {
    await query(`UPDATE conversations SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
  }
  return findById(id);
};

const incrementUnread = async (conversationId, forUserId) => {
  const conv = await findById(conversationId);
  if (!conv) return null;
  const counts = { ...conv.unreadCount };
  counts[forUserId] = (counts[forUserId] || 0) + 1;
  return updateById(conversationId, { unreadCount: counts });
};

const resetUnread = async (conversationId, forUserId) => {
  const conv = await findById(conversationId);
  if (!conv) return null;
  const counts = { ...conv.unreadCount, [forUserId]: 0 };
  return updateById(conversationId, { unreadCount: counts });
};

const countForParticipant = async (userId) => {
  const r = await queryOne(
    'SELECT COUNT(*) AS c FROM conversations WHERE user_a = ? OR user_b = ?',
    [userId, userId]
  );
  return r.c;
};

module.exports = {
  create,
  findById,
  findByIdIfParticipant,
  listForUser,
  updateById,
  incrementUnread,
  resetUnread,
  countForParticipant,
};
