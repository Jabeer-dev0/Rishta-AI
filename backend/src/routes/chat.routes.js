const router = require('express').Router();
const { getConversations, getMessages, markAsRead, getConversation } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/read', markAsRead);

module.exports = router;
