/**
 * Notification repository backed by Cloudflare D1.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');

const safeParse = (v, f) => {
  if (v == null) return f;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return f; }
};

const mapRow = (row) => ({
  _id: row.id,
  recipient: row.recipient,
  type: row.type,
  title: row.title,
  body: row.body,
  data: safeParse(row.data, {}),
  isRead: !!row.is_read,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const create = async ({ recipient, type, title, body, data = {}, isRead = false }) => {
  const id = newId();
  const now = nowISO();
  await query(
    `INSERT INTO notifications (id, recipient, type, title, body, data, is_read, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, recipient, type, title, body, JSON.stringify(data), isRead ? 1 : 0, now, now]
  );
  return findById(id);
};

const findById = async (id) => mapRow(await queryOne('SELECT * FROM notifications WHERE id = ?', [id]));

const listForRecipient = async (recipientId, limit = 50) => {
  const r = await query(
    'SELECT * FROM notifications WHERE recipient = ? ORDER BY created_at DESC LIMIT ?',
    [recipientId, limit]
  );
  return r.results.map(mapRow);
};

const markRead = async (id, recipientId) => {
  await query(
    'UPDATE notifications SET is_read = 1, updated_at = ? WHERE id = ? AND recipient = ?',
    [nowISO(), id, recipientId]
  );
};

const markAllRead = async (recipientId) => {
  await query(
    'UPDATE notifications SET is_read = 1, updated_at = ? WHERE recipient = ? AND is_read = 0',
    [nowISO(), recipientId]
  );
};

const deleteOne = async (id, recipientId) => {
  await query('DELETE FROM notifications WHERE id = ? AND recipient = ?', [id, recipientId]);
};

const countUnread = async (recipientId) => {
  const r = await queryOne(
    'SELECT COUNT(*) AS c FROM notifications WHERE recipient = ? AND is_read = 0',
    [recipientId]
  );
  return r.c;
};

module.exports = { create, findById, listForRecipient, markRead, markAllRead, deleteOne, countUnread };
