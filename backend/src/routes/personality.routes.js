const router = require('express').Router();
const { getQuestions, submitTest, getResult } = require('../controllers/personality.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/questions', getQuestions);
router.post('/submit', submitTest);
router.get('/result', getResult);

module.exports = router;
