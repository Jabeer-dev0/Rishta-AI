/**
 * Report repository backed by Cloudflare D1.
 */

const { query, queryOne, newId, nowISO } = require('../config/db');
const User = require('./User.model');

const mapRow = (row) => ({
  _id: row.id,
  reportedBy: row.reported_by,
  reportedUser: row.reported_user,
  reason: row.reason,
  description: row.description,
  status: row.status,
  adminNote: row.admin_note,
  resolvedBy: row.resolved_by,
  resolvedAt: row.resolved_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const create = async ({ reportedBy, reportedUser, reason, description }) => {
  const id = newId();
  const now = nowISO();
  await query(
    `INSERT INTO reports (id, reported_by, reported_user, reason, description, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'open', ?, ?)`,
    [id, reportedBy, reportedUser, reason, description || null, now, now]
  );
  return findById(id);
};

const findById = async (id) => mapRow(await queryOne('SELECT * FROM reports WHERE id = ?', [id]));

const listOpen = async () => {
  const r = await query(
    `SELECT * FROM reports WHERE status = 'open' ORDER BY created_at DESC`
  );
  const reports = r.results.map(mapRow);
  return Promise.all(
    reports.map(async (rep) => {
      const [reporter, reported] = await Promise.all([
        User.findById(rep.reportedBy),
        User.findById(rep.reportedUser),
      ]);
      return {
        ...rep,
        reportedBy: reporter ? User.pickPublicFields(reporter, 'name email') : null,
        reportedUser: reported ? User.pickPublicFields(reported, 'name email') : null,
      };
    })
  );
};

const updateById = async (id, fields = {}) => {
  const sets = [];
  const values = [];
  if ('status' in fields) { sets.push('status = ?'); values.push(fields.status); }
  if ('adminNote' in fields) { sets.push('admin_note = ?'); values.push(fields.adminNote); }
  if ('resolvedBy' in fields) { sets.push('resolved_by = ?'); values.push(fields.resolvedBy); }
  if ('resolvedAt' in fields) { sets.push('resolved_at = ?'); values.push(fields.resolvedAt instanceof Date ? fields.resolvedAt.toISOString() : fields.resolvedAt); }
  sets.push('updated_at = ?');
  values.push(nowISO());
  await query(`UPDATE reports SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
  return findById(id);
};

module.exports = { create, findById, listOpen, updateById };
