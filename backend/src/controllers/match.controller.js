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

    let matches = await Match.find({ user: req.user._id, isActive: true })
      .populate('matchedUser', 'name age city profession education religion interests photos profilePhoto verified')
      .sort({ compatibilityScore: -1 })
      .limit(20);

    // If no matches yet, generate them
    if (matches.length === 0) {
      await generateMatchPool(req.user._id);
      matches = await Match.find({ user: req.user._id, isActive: true })
        .populate('matchedUser', 'name age city profession education religion interests photos profilePhoto verified')
        .sort({ compatibilityScore: -1 })
        .limit(20);
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
    const match = await Match.findOne({ _id: req.params.matchId, user: req.user._id })
      .populate('matchedUser', 'name age city profession education religion interests photos profilePhoto verified bio familyBackground');
    if (!match) return error(res, 'Match not found.', 404);
    return success(res, { data: { match } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/matches/regenerate  — Force fresh match pool
const regenerateMatches = async (req, res) => {
  try {
    await Match.updateMany({ user: req.user._id }, { isActive: false });
    await generateMatchPool(req.user._id);
    const matches = await Match.find({ user: req.user._id, isActive: true })
      .populate('matchedUser', 'name age city profession education religion interests photos profilePhoto verified')
      .sort({ compatibilityScore: -1 });
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

    const query = {
      _id: { $ne: currentUser._id },
      isActive: true,
      isBlocked: false,
      gender: currentUser.gender === 'Male' ? 'Female' : 'Male',
      role: 'user',
    };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { profession: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }
    if (city) query.city = new RegExp(city, 'i');
    if (minAge || maxAge) query.age = {};
    if (minAge) query.age.$gte = parseInt(minAge);
    if (maxAge) query.age.$lte = parseInt(maxAge);
    if (education) query.education = new RegExp(education, 'i');
    if (religion) query.religion = new RegExp(religion, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [profiles, total] = await Promise.all([
      User.find(query)
        .select('name age city profession education religion interests photos profilePhoto verified bio')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ profileCompletion: -1, lastActiveAt: -1 }),
      User.countDocuments(query),
    ]);

    const profilesWithStatus = await attachConnectionStatus(profiles, req.user._id);

    return success(res, {
      data: {
        profiles: profilesWithStatus,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getMyMatches, getMatch, regenerateMatches, exploreProfiles };
