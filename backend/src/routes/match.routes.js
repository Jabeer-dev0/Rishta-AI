const router = require('express').Router();
const { getMyMatches, getMatch, regenerateMatches, exploreProfiles } = require('../controllers/match.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getMyMatches);
router.get('/explore', exploreProfiles);
router.post('/regenerate', regenerateMatches);
router.get('/:matchId', getMatch);

module.exports = router;
