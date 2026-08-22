const router = require('express').Router();
const { getOAuthUrl, handleCallback, analyzePlatform, disconnect, getInsights } = require('../controllers/social.controller');
const { protect } = require('../middleware/auth.middleware');

// OAuth callback is public (redirected from platform) but uses state param for user id
router.get('/:platform/oauth-url', protect, getOAuthUrl);
router.get('/:platform/callback', handleCallback);
router.post('/analyze', protect, analyzePlatform);
router.post('/disconnect/:platform', protect, disconnect);
router.get('/insights', protect, getInsights);

module.exports = router;
