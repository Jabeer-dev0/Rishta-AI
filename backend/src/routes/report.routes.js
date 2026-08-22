const router = require('express').Router();
const { reportUser, blockUser, unblockUser, getBlockedUsers } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/', reportUser);
router.get('/blocked-users', getBlockedUsers);
router.post('/block/:userId', blockUser);
router.delete('/unblock/:userId', unblockUser);

module.exports = router;
