/**
 * ConnectionRequest repository backed by Cloudflare D1.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');
const User = require('./User.model');

const safeParse = (v, f) => {
  if (v == null) return f;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return f; }
};

const mapRow = (row) => ({
  _id: row.id,
  fromUser: row.from_user,
  toUser: row.to_user,
  status: row.status,
  message: row.message,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const create = async ({ fromUser, toUser, message, status = 'pending' }) => {
  const id = newId();
  const now = nowISO();
  await query(
    `INSERT INTO connection_requests (id, from_user, to_user, status, message, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, fromUser, toUser, status, message || null, now, now]
  );
  return findById(id);
};

const findById = async (id) => mapRow(await queryOne('SELECT * FROM connection_requests WHERE id = ?', [id]));

const findOneByIdAndFields = async (id, fields) => {
  const clauses = ['id = ?'];
  const params = [id];
  if (fields.toUser) { clauses.push('to_user = ?'); params.push(fields.toUser); }
  if (fields.fromUser) { clauses.push('from_user = ?'); params.push(fields.fromUser); }
  if (fields.status) { clauses.push('status = ?'); params.push(fields.status); }
  const row = await queryOne(`SELECT * FROM connection_requests WHERE ${clauses.join(' AND ')}`, params);
  return mapRow(row);
};

/** Any pending request between the two users in either direction. */
const findPendingBetween = async (userA, userB) => {
  const row = await queryOne(
    `SELECT * FROM connection_requests
     WHERE status = 'pending'
       AND ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?))
     LIMIT 1`,
    [userA, userB, userB, userA]
  );
  return mapRow(row);
};

const updateStatus = async (id, status) => {
  await query(
    'UPDATE connection_requests SET status = ?, updated_at = ? WHERE id = ?',
    [status, nowISO(), id]
  );
  return findById(id);
};

/** All requests where toUser = me and status = pending, newest first. */
const listReceived = async (userId) => {
  const r = await query(
    `SELECT * FROM connection_requests WHERE to_user = ? AND status = 'pending' ORDER BY created_at DESC`,
    [userId]
  );
  return attachUsers(r.results.map(mapRow), 'fromUser');
};

const listSent = async (userId) => {
  const r = await query(
    'SELECT * FROM connection_requests WHERE from_user = ? ORDER BY created_at DESC',
    [userId]
  );
  return attachUsers(r.results.map(mapRow), 'toUser');
};

const USER_POPULATE_FIELDS = 'name age city profession profilePhoto verified';

const attachUsers = async (requests, populateField) => {
  return Promise.all(
    requests.map(async (reqObj) => {
      const other = await User.findById(reqObj[populateField]);
      return { ...reqObj, [populateField]: other ? User.pickPublicFields(other, USER_POPULATE_FIELDS) : null };
    })
  );
};

/** Populate both endpoints (used for the accept-request response). */
const attachBothUsers = async (request) => {
  if (!request) return request;
  const [from, to] = await Promise.all([
    User.findById(request.fromUser),
    User.findById(request.toUser),
  ]);
  return {
    ...request,
    fromUser: from ? User.pickPublicFields(from, 'name city profilePhoto') : null,
    toUser: to ? User.pickPublicFields(to, 'name city profilePhoto') : null,
  };
};

/** Requests involving me and any of the given users ("$or" lookup for status badges). */
const findBetween = async (currentUserId, userIds) => {
  if (!userIds.length) return [];
  const placeholders = userIds.map(() => '?').join(', ');
  const r = await query(
    `SELECT * FROM connection_requests
     WHERE (from_user = ? AND to_user IN (${placeholders}))
        OR (to_user = ? AND from_user IN (${placeholders}))`,
    [currentUserId, ...userIds, currentUserId, ...userIds]
  );
  return r.results.map(mapRow);
};

const countPendingFor = async (userId) => {
  const r = await queryOne(
    `SELECT COUNT(*) AS c FROM connection_requests WHERE to_user = ? AND status = 'pending'`,
    [userId]
  );
  return r.c;
};

module.exports = {
  create,
  findById,
  findOneByIdAndFields,
  findPendingBetween,
  updateStatus,
  listReceived,
  listSent,
  findBetween,
  countPendingFor,
  attachBothUsers,
};
