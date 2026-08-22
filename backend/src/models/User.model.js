/**
 * User repository backed by Cloudflare D1.
 * Replaces the old Mongoose User model while keeping the
 * same response shapes (_id, camelCase fields, virtuals).
 */

const bcrypt = require('bcryptjs');
const { query, queryOne, newId, nowISO } = require('../config/db');

const JSON_FIELDS = ['interests', 'photos', 'partnerPreferences', 'personalityScores', 'socialMediaConnected', 'socialTokens', 'socialInsights', 'blockedUsers', 'notificationPrefs'];
const BOOL_FIELDS = ['verified', 'isActive', 'isBlocked'];

const getZodiacSign = (dob) => {
  if (!dob) return null;
  const date = new Date(dob);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return null;
};

/** snake_case row -> public-ish user object */
const mapUser = (row) => {
  if (!row) return null;
  const user = {
    _id: row.id,
    email: row.email,
    password: undefined,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    gender: row.gender,
    religion: row.religion,
    city: row.city,
    country: row.country,
    education: row.education,
    profession: row.profession,
    familyBackground: row.family_background,
    bio: row.bio,
    photos: safeParse(row.photos, []),
    profilePhoto: row.profile_photo,
    verified: !!row.verified,
    cnicImageUrl: row.cnic_image_url,
    selfieImageUrl: row.selfie_image_url,
    verificationStatus: row.verification_status,
    partnerPreferences: safeParse(row.partner_preferences, { ageRange: { min: 20, max: 40 }, cities: [], education: [], religions: [], professions: [] }),
    personalityScores: safeParse(row.personality_scores, {}),
    socialMediaConnected: safeParse(row.social_media_connected, { instagram: false, facebook: false, twitter: false }),
    socialTokens: safeParse(row.social_tokens, {}),
    socialInsights: safeParse(row.social_insights, { detectedInterests: [], dataPoints: 0 }),
    profileViews: row.profile_views || 0,
    profileCompletion: row.profile_completion ?? 40,
    aiScore: row.ai_score || 0,
    blockedUsers: safeParse(row.blocked_users, []),
    isActive: !!row.is_active,
    isBlocked: !!row.is_blocked,
    role: row.role,
    passwordResetToken: row.password_reset_token,
    passwordResetExpires: row.password_reset_expires,
    notificationPrefs: safeParse(row.notification_prefs, { matches: true, messages: true, requests: true, marketing: false }),
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    zodiacSign: getZodiacSign(row.date_of_birth),
  };
  JSON_FIELDS.forEach((f) => { if (user[f] == null) delete user[f]; });
  // Attach instance-style helpers so controllers keep working unchanged.
  user.toPublicProfile = () => stripSensitive(user);
  user.calculateCompletion = () => calculateProfileCompletion(user);
  return user;
};

function safeParse(value, fallback) {
  if (value == null) return fallback;
  try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return fallback; }
}

const SENSITIVE = ['password', 'cnicImageUrl', 'selfieImageUrl', 'socialTokens', 'passwordResetToken', 'passwordResetExpires', 'blockedUsers'];

const stripSensitive = (user) => {
  const clone = { ...user };
  SENSITIVE.forEach((f) => { delete clone[f]; });
  return clone;
};

const calculateProfileCompletion = (u) => {
  let score = 40;
  if (u.education && u.profession) score += 20;
  if (u.verified) score += 15;
  if (u.personalityScores?.personalityType) score += 15;
  if (Object.values(u.socialMediaConnected || {}).some(Boolean)) score += 10;
  return Math.min(score, 100);
};

const COLUMN_MAP = {
  email: 'email', password: 'password', name: 'name', dateOfBirth: 'date_of_birth', age: 'age',
  gender: 'gender', religion: 'religion', city: 'city', country: 'country', education: 'education',
  profession: 'profession', familyBackground: 'family_background', bio: 'bio',
  interests: 'interests', photos: 'photos', profilePhoto: 'profile_photo', verified: 'verified',
  cnicImageUrl: 'cnic_image_url', selfieImageUrl: 'selfie_image_url', verificationStatus: 'verification_status',
  partnerPreferences: 'partner_preferences', personalityScores: 'personality_scores',
  socialMediaConnected: 'social_media_connected', socialTokens: 'social_tokens',
  socialInsights: 'social_insights', profileViews: 'profile_views', profileCompletion: 'profile_completion',
  aiScore: 'ai_score', blockedUsers: 'blocked_users', isActive: 'is_active', isBlocked: 'is_blocked',
  role: 'role', passwordResetToken: 'password_reset_token', passwordResetExpires: 'password_reset_expires',
  notificationPrefs: 'notification_prefs', lastActiveAt: 'last_active_at',
};

const encodeValue = (key, value) => {
  if (value === undefined) return null;
  if (JSON_FIELDS.includes(key)) return value == null ? null : JSON.stringify(value);
  if (BOOL_FIELDS.includes(key)) return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  return value;
};

const buildUpdate = (updates) => {
  const keys = Object.keys(updates).filter((k) => COLUMN_MAP[k] !== undefined && updates[k] !== undefined);
  return {
    sets: keys.map((k) => `${COLUMN_MAP[k]} = ?`),
    values: keys.map((k) => encodeValue(k, updates[k])),
  };
};

const findById = async (id) => {
  const row = await queryOne('SELECT * FROM users WHERE id = ?', [id]);
  return mapUser(row);
};

const findByEmail = async (email, includePassword = true) => {
  const row = await queryOne('SELECT * FROM users WHERE email = ?', [(email || '').toLowerCase()]);
  const user = mapUser(row);
  if (!includePassword && user) delete user.password;
  return user;
};

/** Valid (non-expired) password reset token lookup. */
const findByResetToken = async (hashedToken) => {
  const row = await queryOne(
    'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > ?',
    [hashedToken, Date.now()]
  );
  return mapUser(row);
};

const create = async (data) => {
  const id = newId();
  const now = nowISO();
  const payload = {
    id,
    email: (data.email || '').toLowerCase(),
    password: data.password,
    name: data.name,
    dateOfBirth: data.dateOfBirth,
    age: data.age,
    gender: data.gender,
    religion: data.religion,
    city: data.city,
    country: data.country || 'Pakistan',
    education: data.education,
    profession: data.profession,
    familyBackground: data.familyBackground,
    bio: data.bio,
    interests: Array.isArray(data.interests) ? data.interests : [],
    photos: Array.isArray(data.photos) ? data.photos : [],
    profilePhoto: data.profilePhoto || null,
    partnerPreferences: { ageRange: { min: 20, max: 40 }, cities: [], education: [], religions: [], professions: [] },
    socialMediaConnected: { instagram: false, facebook: false, twitter: false },
    blockedUsers: [],
    notificationPrefs: { matches: true, messages: true, requests: true, marketing: false },
    lastActiveAt: now,
  };

  const cols = Object.keys(payload).map((k) => COLUMN_MAP[k] || k);
  const placeholders = cols.map(() => '?').join(', ');
  const values = Object.keys(payload).map((k) => encodeValue(k, payload[k]));
  await query(
    `INSERT INTO users (${cols.join(', ')}, created_at, updated_at) VALUES (${placeholders}, ?, ?)`,
    [...values, now, now]
  );
  return findById(id);
};

const hashPassword = (plain) => bcrypt.hash(plain, 12);

const comparePassword = (candidate, hash) => bcrypt.compare(candidate, hash);

const updateById = async (id, updates) => {
  const { sets, values } = buildUpdate({ ...updates, updatedAt: nowISO() });
  if (sets.length > 0) {
    await query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
  }
  return findById(id);
};

/** Pick a subset of fields ("name age city") from a mapped user object. */
const pickPublicFields = (user, fieldList) => {
  if (!user) return null;
  const fields = typeof fieldList === 'string' ? fieldList.split(' ').filter(Boolean) : fieldList;
  const out = { _id: user._id };
  fields.forEach((f) => {
    if (user[f] !== undefined && !SENSITIVE.includes(f)) out[f] = user[f];
  });
  return out;
};

/** Raw row query returning mapped users (used by explore/admin listings). */
const queryRows = async (sql, params = []) => {
  const result = await query(sql, params);
  return result.results;
};

const countRows = async (where, params = []) => {
  const r = await queryOne(`SELECT COUNT(*) AS c FROM users WHERE ${where}`, params);
  return r.c;
};

const deleteById = async (id) => {
  await query('DELETE FROM users WHERE id = ?', [id]);
};

/** Delete all @rishtaai.test demo users (seeder). */
const deleteTestUsers = async () => {
  await query("DELETE FROM users WHERE email LIKE '%@rishtaai.test'");
};

const deleteAll = async () => {
  await query('DELETE FROM users');
};

/** Increment a numeric column atomically ($inc equivalent). */
const incrementField = async (id, column, by = 1) => {
  const col = COLUMN_MAP[column];
  if (!col) throw new Error(`Cannot increment unknown field: ${column}`);
  await query(`UPDATE users SET ${col} = ${col} + ?, updated_at = ? WHERE id = ?`, [by, nowISO(), id]);
};

module.exports = {
  findById,
  findByEmail,
  findByResetToken,
  create,
  updateById,
  mapUser,
  stripSensitive,
  toPublicProfile: stripSensitive,
  pickPublicFields,
  queryRows,
  countRows,
  deleteById,
  deleteTestUsers,
  deleteAll,
  incrementField,
  comparePassword,
  hashPassword,
  calculateProfileCompletion,
};
