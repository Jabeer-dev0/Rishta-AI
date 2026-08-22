const router = require('express').Router();
const {
  getMyProfile, updateMyProfile, getProfile, uploadPhoto,
  deletePhoto, updatePreferences, getStats, updateNotifications, deleteAccount,
} = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

router.use(protect);
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.get('/me/stats', getStats);
router.put('/me/preferences', updatePreferences);
router.put('/me/notifications', updateNotifications);
router.delete('/me', deleteAccount);
router.post('/me/photo', uploadSingle('photo'), uploadPhoto);
router.delete('/me/photo/:index', deletePhoto);
router.get('/:userId', getProfile);

module.exports = router;
