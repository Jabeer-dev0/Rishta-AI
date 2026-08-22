const { generateCompatibilityReport, evaluateGuestCompatibility, generateStarInsight } = require('../services/ai.service');
const Match = require('../models/Match.model');
const User = require('../models/User.model');
const GuestCompatibility = require('../models/GuestCompatibility.model');
const crypto = require('crypto');
const { success, error } = require('../utils/response.utils');

// POST /api/ai/compatibility-report
const generateReport = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return error(res, 'targetUserId is required.', 400);

    const [userA, userB] = await Promise.all([
      User.findById(req.user._id),
      User.findById(targetUserId),
    ]);
    if (!userB) return error(res, 'Target user not found.', 404);

    const report = await generateCompatibilityReport(userA, userB);

    // Cache in Match row if it exists
    await Match.updateReportForPair(req.user._id, targetUserId, {
      aiInsights: {
        personalityMatch: report.personalityMatch,
        lifestyleCompatibility: report.lifestyleCompatibility,
        emotionalCompatibility: report.emotionalCompatibility,
        longTermStability: report.longTermStability,
        strengths: report.strengths,
        potentialHurdles: report.potentialHurdles,
      },
      report: report.report || report.reportText || null,
    });

    return success(res, { data: { report } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/ai/star-insight/:targetUserId
const getStarInsight = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const [userA, userB] = await Promise.all([
      User.findById(req.user._id),
      User.findById(targetUserId),
    ]);

    if (!userB) return error(res, 'Target user not found.', 404);

    const insight = await generateStarInsight(userA, userB);

    // Cache it
    await Match.updateReportForPair(req.user._id, targetUserId, {
      aiInsights: { starInsight: insight },
    });

    return success(res, { data: { insight } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/ai/guest-compatibility
const checkGuestCompatibility = async (req, res) => {
  try {
    // Parse form data strings if they exist
    const dataA = req.body.dataA ? JSON.parse(req.body.dataA) : {};
    const dataB = req.body.dataB ? JSON.parse(req.body.dataB) : {};

    const result = await evaluateGuestCompatibility(dataA, dataB, req.files);

    return success(res, { data: result }, 'Compatibility check successful');
  } catch (err) {
    console.error('[AIController] Guest Check Error:', err);
    return error(res, 'Failed to evaluate compatibility. Please ensure all data is provided correctly.', 500);
  }
};

// GET /api/ai/report/:matchId
const getCachedReport = async (req, res) => {
  try {
    const match = await Match.findOneByIdAndUser(req.params.matchId, req.user._id);
    if (!match) return error(res, 'Match report not found.', 404);
    return success(res, { data: { match } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/ai/guest-session - User A starts
const createGuestSession = async (req, res) => {
  try {
    const { dataA } = req.body;
    if (!dataA) return error(res, 'Profile data is required', 400);

    const sessionId = crypto.randomBytes(4).toString('hex');
    await GuestCompatibility.create({
      sessionId,
      personA: typeof dataA === 'string' ? JSON.parse(dataA) : dataA,
    });

    return success(res, { data: { sessionId } }, 'Invitation link generated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/ai/guest-session/:sessionId - User B views
const getGuestSession = async (req, res) => {
  try {
    const session = await GuestCompatibility.findBySessionId(req.params.sessionId);
    if (!session) return error(res, 'Session not found', 404);

    return success(res, {
      data: {
        personAName: session.personA.name,
        status: session.status,
        result: session.result
      }
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/ai/guest-session/:sessionId/complete - User B completes
const completeGuestSession = async (req, res) => {
  try {
    const { dataB } = req.body;
    const session = await GuestCompatibility.findBySessionId(req.params.sessionId);

    if (!session) return error(res, 'Session not found', 404);
    if (session.status === 'completed') return success(res, { data: session.result });

    const parsedDataB = typeof dataB === 'string' ? JSON.parse(dataB) : dataB;
    const result = await evaluateGuestCompatibility(session.personA, parsedDataB);

    await GuestCompatibility.completeSession(req.params.sessionId, parsedDataB, result);

    return success(res, { data: result }, 'Compatibility analysis complete');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  generateReport,
  getCachedReport,
  checkGuestCompatibility,
  createGuestSession,
  getGuestSession,
  completeGuestSession,
  getStarInsight
};
