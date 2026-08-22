/**
 * Message repository backed by Cloudflare D1.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');
const User = require('./User.model');

const safeParse = (v, f) => {
  if (v == null) return f;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return f; }
};

const mapRow = (row) => ({
  _id: row.id,
  conversation: row.conversation_id,
  sender: row.sender_id,
  text: row.text,
  mediaUrl: row.media_url,
  mediaType: row.media_type || 'text',
  seenBy: safeParse(row.seen_by, []),
  deliveredTo: safeParse(row.delivered_to, []),
  isDeleted: !!row.is_deleted,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const create = async ({ conversation, sender, text, mediaType = 'text', mediaUrl, deliveredTo = [], seenBy = [], createdAt }) => {
  const id = newId();
  const now = createdAt instanceof Date ? createdAt.toISOString() : (createdAt || nowISO());
  await query(
    `INSERT INTO messages (id, conversation_id, sender_id, text, media_url, media_type, seen_by, delivered_to, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id, conversation, sender, text || null, mediaUrl || null, mediaType,
      JSON.stringify(seenBy), JSON.stringify(deliveredTo), now, now,
    ]
  );
  return findById(id);
};

const findById = async (id) => mapRow(await queryOne('SELECT * FROM messages WHERE id = ?', [id]));

const SENDER_FIELDS = 'name profilePhoto verified';

/** Paginated messages for a conversation with sender populated. */
const listForConversation = async (conversationId, { page = 1, limit = 30 } = {}) => {
  const offset = (page - 1) * limit;
  const r = await query(
    `SELECT * FROM messages WHERE conversation_id = ? AND is_deleted = 0
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [conversationId, limit, offset]
  );
  const totalRow = await queryOne(
    'SELECT COUNT(*) AS c FROM messages WHERE conversation_id = ? AND is_deleted = 0',
    [conversationId]
  );
  const messages = await Promise.all(
    r.results.map(mapRow).map(async (m) => {
      const sender = await User.findById(m.sender);
      return { ...m, sender: sender ? User.pickPublicFields(sender, SENDER_FIELDS) : null };
    })
  );
  return { messages: messages.reverse(), total: totalRow.c };
};

/** Add userId to seenBy of all unseen messages in a conversation. */
const markSeenInConversation = async (conversationId, userId) => {
  const r = await query(
    'SELECT * FROM messages WHERE conversation_id = ? AND is_deleted = 0',
    [conversationId]
  );
  let changed = false;
  for (const row of r.results) {
    const msg = mapRow(row);
    if (!msg.seenBy.includes(userId)) {
      await query('UPDATE messages SET seen_by = ?, updated_at = ? WHERE id = ?', [
        JSON.stringify([...msg.seenBy, userId]), nowISO(), msg._id,
      ]);
      changed = true;
    }
  }
  return changed;
};

module.exports = { create, findById, listForConversation, markSeenInConversation };
