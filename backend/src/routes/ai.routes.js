const router = require('express').Router();
const { 
  generateReport, 
  getCachedReport, 
  checkGuestCompatibility,
  createGuestSession,
  getGuestSession,
  completeGuestSession,
  getStarInsight
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadDocs } = require('../middleware/upload.middleware');

// Public routes
router.post('/guest-compatibility', uploadDocs, checkGuestCompatibility);
router.post('/guest-session', createGuestSession);
router.get('/guest-session/:sessionId', getGuestSession);
router.post('/guest-session/:sessionId/complete', completeGuestSession);

// Protected routes
router.use(protect);
router.post('/compatibility-report', generateReport);
router.get('/report/:matchId', getCachedReport);
router.get('/star-insight/:targetUserId', getStarInsight);

module.exports = router;
