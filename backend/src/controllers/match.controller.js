const Match = require('../models/Match.model');
const User = require('../models/User.model');
const { generateMatchPool } = require('../services/matchEngine.service');
const { attachConnectionStatus } = require('../utils/connection.utils');
const { success, error } = require('../utils/response.utils');

// GET /api/matches  — AI curated matches for current user
const getMyMatches = async (req, res) => {
  try {
    // Admins don't get matches
    if (req.user.role === 'admin') {
      return success(res, { data: { matches: [] } });
    }

    let matches = await Match.findForUser(req.user._id, { limit: 20 });

    // If no matches yet, generate them
    if (matches.length === 0) {
      await generateMatchPool(req.user._id);
      matches = await Match.findForUser(req.user._id, { limit: 20 });
    }

    const matchesWithStatus = await attachConnectionStatus(matches, req.user._id);

    return success(res, { data: { matches: matchesWithStatus } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/matches/:matchId  — Single match with full AI report
const getMatch = async (req, res) => {
  try {
    const match = await Match.findOneByIdAndUser(req.params.matchId, req.user._id);
    if (!match) return error(res, 'Match not found.', 404);
    return success(res, { data: { match } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/matches/regenerate  — Force fresh match pool
const regenerateMatches = async (req, res) => {
  try {
    await Match.deactivateAllForUser(req.user._id);
    await generateMatchPool(req.user._id);
    const matches = await Match.findForUser(req.user._id, {});
    return success(res, { data: { matches } }, 'Matches regenerated!');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/matches/explore  — Paginated profile browsing with filters
const exploreProfiles = async (req, res) => {
  try {
    const { search, city, minAge, maxAge, education, religion, page = 1, limit = 12 } = req.query;
    const currentUser = req.user;

    const oppositeGender = currentUser.gender === 'Male' ? 'Female' : 'Male';
    const clauses = [
      'id != ?', 'is_active = 1', 'is_blocked = 0',
      'gender = ?', "role = 'user'",
    ];
    const params = [currentUser._id, oppositeGender];

    if (search) {
      clauses.push('(name LIKE ? OR profession LIKE ? OR city LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (city) { clauses.push('city LIKE ?'); params.push(`%${city}%`); }
    if (minAge) { clauses.push('age >= ?'); params.push(parseInt(minAge)); }
    if (maxAge) { clauses.push('age <= ?'); params.push(parseInt(maxAge)); }
    if (education) { clauses.push('education LIKE ?'); params.push(`%${education}%`); }
    if (religion) { clauses.push('religion LIKE ?'); params.push(`%${religion}%`); }

    const where = clauses.join(' AND ');
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rows, totalRow] = await Promise.all([
      User.queryRows(
        `SELECT * FROM users WHERE ${where}
         ORDER BY profile_completion DESC, last_active_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), skip]
      ),
      User.countRows(where, params),
    ]);

    const profiles = rows.map(User.mapUser);
    const profilesWithStatus = await attachConnectionStatus(profiles, req.user._id);

    return success(res, {
      data: {
        profiles: profilesWithStatus,
        pagination: { total: totalRow, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(totalRow / parseInt(limit)) },
      }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getMyMatches, getMatch, regenerateMatches, exploreProfiles };
