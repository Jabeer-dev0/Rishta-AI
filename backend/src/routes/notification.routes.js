const router = require('express').Router();
const { getAll, markRead, markAllRead, deleteOne, getUnreadCount } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getAll);
router.get('/unread-count', getUnreadCount);
router.post('/read-all', markAllRead);
router.post('/:id/read', markRead);
router.delete('/:id', deleteOne);

module.exports = router;
