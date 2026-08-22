const router = require('express').Router();
const { uploadSelfie, runVerification, getVerificationStatus } = require('../controllers/verify.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

router.use(protect);
router.post('/upload-selfie', uploadSingle('selfie'), uploadSelfie);
router.post('/run-verification', runVerification);
router.get('/status', getVerificationStatus);

module.exports = router;
