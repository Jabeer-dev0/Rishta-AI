const router = require('express').Router();
const { register, login, logout, getMe, refreshToken, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const { uploadSingle } = require('../middleware/upload.middleware');

router.post('/register', uploadSingle('profilePhoto'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
