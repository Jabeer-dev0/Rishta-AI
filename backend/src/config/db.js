/**
 * Cloudflare D1 data layer (replaces MongoDB/Mongoose).
 * Talks to D1 over the Cloudflare REST API, so the Express
 * server can run anywhere (Render) while data lives in D1.
 */

const crypto = require('crypto');

const API_BASE = 'https://api.cloudflare.com/client/v4';

const accountId = () => process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = () => process.env.CLOUDFLARE_D1_DATABASE_ID;
const apiToken = () => process.env.CLOUDFLARE_D1_API_TOKEN;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  date_of_birth TEXT,
  age INTEGER,
  gender TEXT,
  religion TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  education TEXT,
  profession TEXT,
  family_background TEXT,
  bio TEXT,
  interests TEXT DEFAULT '[]',
  photos TEXT DEFAULT '[]',
  profile_photo TEXT,
  verified INTEGER DEFAULT 0,
  cnic_image_url TEXT,
  selfie_image_url TEXT,
  verification_status TEXT DEFAULT 'unverified',
  partner_preferences TEXT,
  personality_scores TEXT,
  social_media_connected TEXT,
  social_tokens TEXT,
  social_insights TEXT,
  profile_views INTEGER DEFAULT 0,
  profile_completion INTEGER DEFAULT 40,
  ai_score REAL DEFAULT 0,
  blocked_users TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  is_blocked INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user',
  password_reset_token TEXT,
  password_reset_expires INTEGER,
  notification_prefs TEXT,
  last_active_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  matched_user_id TEXT NOT NULL,
  compatibility_score REAL,
  ai_insights TEXT,
  match_reasons TEXT,
  report TEXT,
  is_active INTEGER DEFAULT 1,
  generated_at TEXT,
  expires_at TEXT,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE(user_id, matched_user_id)
);
CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(user_id, is_active);

CREATE TABLE IF NOT EXISTS connection_requests (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_conn_to_user ON connection_requests(to_user, status);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_a TEXT NOT NULL,
  user_b TEXT NOT NULL,
  connection_request_id TEXT,
  last_message TEXT,
  last_message_time TEXT,
  last_message_by TEXT,
  unread_count TEXT DEFAULT '{}',
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  text TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'text',
  seen_by TEXT DEFAULT '[]',
  delivered_to TEXT DEFAULT '[]',
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  data TEXT DEFAULT '{}',
  is_read INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient, created_at);

CREATE TABLE IF NOT EXISTS personality_results (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  answers TEXT,
  scores TEXT,
  personality_type TEXT,
  completed_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reported_by TEXT NOT NULL,
  reported_user TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  admin_note TEXT,
  resolved_by TEXT,
  resolved_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS guest_compatibility (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  person_a TEXT,
  person_b TEXT,
  result TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
`;

const requireConfig = () => {
  if (!accountId() || !databaseId() || !apiToken()) {
    throw new Error(
      'Cloudflare D1 env vars missing: set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID and CLOUDFLARE_D1_API_TOKEN.'
    );
  }
};

const d1Request = async (statements) => {
  requireConfig();
  const res = await fetch(`${API_BASE}/accounts/${accountId()}/d1/database/${databaseId()}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statements),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const detail = json.errors ? json.errors.map((e) => `${e.code}: ${e.message}`).join('; ') : res.statusText;
    throw new Error(`D1 query failed: ${detail}`);
  }
  return Array.isArray(statements) ? json.result : json.result[0];
};

/** Run a single statement. Returns { results, meta }. */
const query = async (sql, params = []) => d1Request({ sql, params });

/**
 * Run one or more raw statements with no bound params
 * (D1 only allows multiple statements when params are omitted).
 */
const exec = (sql) => d1Request({ sql });

/** Run an array of parameterized statements. Returns array of results. */
const batch = (statements) => d1Request(statements);

/** Run a statement and return the affected row (use with RETURNING). */
const queryOne = async (sql, params = []) => {
  const result = await query(sql, params);
  return result.results && result.results.length > 0 ? result.results[0] : null;
};

const nowISO = () => new Date().toISOString();

const newId = () => crypto.randomBytes(12).toString('hex');

/** Verify credentials and auto-create tables at boot. */
const init = async () => {
  await query('SELECT 1');
  await exec(SCHEMA_SQL);
  console.log('✅ Cloudflare D1 connected & schema ready');
};

module.exports = { init, query, queryOne, exec, batch, newId, nowISO };
