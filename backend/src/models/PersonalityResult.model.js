/**
 * PersonalityResult repository backed by Cloudflare D1.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');

const safeParse = (v, f) => {
  if (v == null) return f;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return f; }
};

const mapRow = (row) => ({
  _id: row.id,
  user: row.user_id,
  answers: safeParse(row.answers, []),
  scores: safeParse(row.scores, {}),
  personalityType: row.personality_type,
  completedAt: row.completed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/** Upsert the single result per user. */
const upsertForUser = async ({ user, answers, scores, personalityType, completedAt }) => {
  const existing = await queryOne('SELECT id FROM personality_results WHERE user_id = ?', [user]);
  const now = nowISO();
  if (existing) {
    await query(
      `UPDATE personality_results
       SET answers = ?, scores = ?, personality_type = ?, completed_at = ?, updated_at = ?
       WHERE user_id = ?`,
      [JSON.stringify(answers), JSON.stringify(scores), personalityType || null, now, now, user]
    );
    return findByUser(user);
  }
  const id = newId();
  await query(
    `INSERT INTO personality_results (id, user_id, answers, scores, personality_type, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user, JSON.stringify(answers), JSON.stringify(scores), personalityType || null, now, now, now]
  );
  return findById(id);
};

const findByUser = async (userId) => mapRow(await queryOne('SELECT * FROM personality_results WHERE user_id = ?', [userId]));

const create = upsertForUser;

const deleteAll = async () => {
  await query('DELETE FROM personality_results');
};

module.exports = { upsertForUser, findByUser, create, deleteAll };
