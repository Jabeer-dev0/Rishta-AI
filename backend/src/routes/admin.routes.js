const router = require('express').Router();
const {
  listUsers, blockUser, unblockUser, manualVerify,
  deleteUser, getReports, resolveReport, getStats,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/adminOnly.middleware');

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.put('/users/:id/verify', manualVerify);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);

module.exports = router;
