/**
 * GuestCompatibility repository backed by Cloudflare D1.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');

const safeParse = (v, f) => {
  if (v == null) return f;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return f; }
};

const mapRow = (row) => ({
  _id: row.id,
  sessionId: row.session_id,
  personA: safeParse(row.person_a, {}),
  personB: safeParse(row.person_b, null),
  result: safeParse(row.result, null),
  status: row.status,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const create = async ({ sessionId, personA, status = 'pending', expiresAt }) => {
  const id = newId();
  const now = nowISO();
  await query(
    `INSERT INTO guest_compatibility (id, session_id, person_a, status, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, sessionId, JSON.stringify(personA || {}), status, expiresAt instanceof Date ? expiresAt.toISOString() : (expiresAt || null), now, now]
  );
  return findBySessionId(sessionId);
};

const findBySessionId = async (sessionId) => mapRow(await queryOne('SELECT * FROM guest_compatibility WHERE session_id = ?', [sessionId]));

const completeSession = async (sessionId, personB, result) => {
  const now = nowISO();
  await query(
    `UPDATE guest_compatibility
     SET person_b = ?, result = ?, status = 'completed', updated_at = ?
     WHERE session_id = ?`,
    [JSON.stringify(personB), JSON.stringify(result), now, sessionId]
  );
  return findBySessionId(sessionId);
};

const deleteAll = async () => {
  await query('DELETE FROM guest_compatibility');
};

module.exports = { create, findBySessionId, completeSession, deleteAll };
