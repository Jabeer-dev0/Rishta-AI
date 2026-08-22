const router = require('express').Router();
const { uploadSelfie, runVerification, getVerificationStatus, submitCnicVerification } = require('../controllers/verify.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadSingle, uploadCnicFields } = require('../middleware/upload.middleware');

router.use(protect);
router.post('/upload-selfie', uploadSingle('selfie'), uploadSelfie);
router.post('/run-verification', runVerification);
router.post('/cnic', uploadCnicFields, submitCnicVerification);
router.get('/status', getVerificationStatus);

module.exports = router;
