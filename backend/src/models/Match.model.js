/**
 * Match repository backed by Cloudflare D1.
 * Keeps the old Mongoose response shape:
 * { _id, user, matchedUser: <populated user fields>, compatibilityScore, aiInsights, matchReasons, report, ... }
 */

const { query, queryOne, batch, newId, nowISO } = require('../config/db');
const User = require('./User.model');

const MATCHED_USER_FIELDS = 'name age city profession education religion interests photos profilePhoto verified bio familyBackground';

const safeParse = (value, fallback) => {
  if (value == null) return fallback;
  try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return fallback; }
};

const mapRow = (row) => ({
  _id: row.id,
  user: row.user_id,
  matchedUser: row.matched_user_id,
  compatibilityScore: row.compatibility_score,
  aiInsights: safeParse(row.ai_insights, null),
  matchReasons: safeParse(row.match_reasons, []),
  report: row.report,
  isActive: !!row.is_active,
  generatedAt: row.generated_at,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/** Attach public profile of the matched user (Mongoose "populate" equivalent). */
const withPopulatedUser = async (match) => {
  if (!match || !match.matchedUser) return match;
  const target = await User.findById(match.matchedUser);
  const pub = target ? User.pickPublicFields(target, MATCHED_USER_FIELDS) : null;
  return { ...match, matchedUser: pub };
};

const findForUser = async (userId, { limit = 20 } = {}) => {
  const result = await query(
    `SELECT * FROM matches WHERE user_id = ? AND is_active = 1
     ORDER BY compatibility_score DESC LIMIT ?`,
    [userId, limit]
  );
  const matches = await Promise.all(result.results.map(mapRow).map(withPopulatedUser));
  return matches;
};

const findOneByIdAndUser = async (matchId, userId) => {
  const row = await queryOne('SELECT * FROM matches WHERE id = ? AND user_id = ?', [matchId, userId]);
  return withPopulatedUser(mapRow(row));
};

const deactivateAllForUser = async (userId) => {
  await query('UPDATE matches SET is_active = 0, updated_at = ? WHERE user_id = ?', [nowISO(), userId]);
};

/** Upsert one match row per candidate pair. */
const upsertOne = async ({ userId, matchedUserId, compatibilityScore, matchReasons, aiInsights }) => {
  await query(
    `INSERT INTO matches (id, user_id, matched_user_id, compatibility_score, match_reasons, ai_insights, is_active, generated_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
     ON CONFLICT(user_id, matched_user_id) DO UPDATE SET
       compatibility_score = excluded.compatibility_score,
       match_reasons = excluded.match_reasons,
       ai_insights = COALESCE(excluded.ai_insights, matches.ai_insights),
       is_active = 1,
       generated_at = excluded.generated_at,
       updated_at = excluded.updated_at`,
    [
      newId(), userId, matchedUserId, compatibilityScore,
      JSON.stringify(matchReasons || []),
      aiInsights ? JSON.stringify(aiInsights) : null,
      nowISO(), nowISO(), nowISO(),
    ]
  );
};

const countForUser = async (userId) => {
  const r = await queryOne('SELECT COUNT(*) AS c FROM matches WHERE user_id = ?', [userId]);
  return r.c;
};

const countAll = async () => {
  const r = await queryOne('SELECT COUNT(*) AS c FROM matches');
  return r.c;
};

const deleteByUserOrMatched = async (userId) => {
  await query('DELETE FROM matches WHERE user_id = ? OR matched_user_id = ?', [userId, userId]);
};

/** Cache AI report on an existing pair (no-op when the pair has no match row). */
const updateReportForPair = async (userId, targetUserId, fields) => {
  const existing = await queryOne(
    'SELECT * FROM matches WHERE user_id = ? AND matched_user_id = ?',
    [userId, targetUserId]
  );
  if (!existing) return;

  let insights = safeParse(existing.ai_insights, {});
  if (fields.aiInsights) insights = { ...insights, ...fields.aiInsights };

  await query(
    `UPDATE matches SET ai_insights = ?, report = COALESCE(?, report), updated_at = ?
     WHERE user_id = ? AND matched_user_id = ?`,
    [JSON.stringify(insights), fields.report || null, nowISO(), userId, targetUserId]
  );
};

module.exports = {
  findForUser,
  findOneByIdAndUser,
  deactivateAllForUser,
  upsertOne,
  countForUser,
  countAll,
  deleteByUserOrMatched,
  updateReportForPair,
};
