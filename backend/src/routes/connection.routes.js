const router = require('express').Router();
const {
  sendRequest, acceptRequest, declineRequest, cancelRequest,
  getReceivedRequests, getSentRequests, unmatch,
} = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.post('/send/:targetUserId', sendRequest);
router.post('/accept/:requestId', acceptRequest);
router.post('/decline/:requestId', declineRequest);
router.post('/cancel/:requestId', cancelRequest);
router.post('/unmatch/:conversationId', unmatch);

module.exports = router;
