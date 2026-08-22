const PersonalityResult = require('../models/PersonalityResult.model');
const User = require('../models/User.model');
const { generateMatchPool } = require('../services/matchEngine.service');
const { success, error } = require('../utils/response.utils');

// The 10 Big Five questions
const QUESTIONS = [
  { id: 1, question: 'I enjoy being the center of attention in social gatherings', category: 'extraversion' },
  { id: 2, question: 'I often plan things carefully before starting', category: 'conscientiousness' },
  { id: 3, question: 'I feel empathy deeply for those going through hardship', category: 'agreeableness' },
  { id: 4, question: 'I love exploring new ideas and experiences', category: 'openness' },
  { id: 5, question: 'I remain calm and composed during stressful situations', category: 'emotionalStability' },
  { id: 6, question: 'I feel energized after spending time with large groups', category: 'extraversion' },
  { id: 7, question: 'I keep my belongings and environment organized', category: 'conscientiousness' },
  { id: 8, question: 'I prioritize others\' needs even at a cost to myself', category: 'agreeableness' },
  { id: 9, question: 'I enjoy creative activities like art, writing, or music', category: 'openness' },
  { id: 10, question: 'I rarely get overwhelmed or anxious about the future', category: 'emotionalStability' },
];

const PERSONALITY_TYPES = {
  extraversion: 'The Socialite',
  conscientiousness: 'The Planner',
  agreeableness: 'The Harmonizer',
  openness: 'The Explorer',
  emotionalStability: 'The Rock',
};

const calculateScores = (answers) => {
  const categoryScores = {};
  QUESTIONS.forEach(q => {
    const ans = answers.find(a => a.questionId === q.id);
    if (ans) {
      if (!categoryScores[q.category]) categoryScores[q.category] = [];
      categoryScores[q.category].push(ans.score);
    }
  });

  const scores = {};
  Object.entries(categoryScores).forEach(([cat, vals]) => {
    scores[cat] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20);
  });

  const dominant = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  return { scores, personalityType: PERSONALITY_TYPES[dominant] };
};

// GET /api/personality/questions
const getQuestions = async (req, res) => {
  return success(res, { data: { questions: QUESTIONS } });
};

// POST /api/personality/submit
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length < 10) {
      return error(res, 'Please answer all 10 questions.', 400);
    }

    const { scores, personalityType } = calculateScores(answers);

    // Upsert result
    await PersonalityResult.findOneAndUpdate(
      { user: req.user._id },
      { answers, scores, personalityType, completedAt: new Date() },
      { upsert: true, new: true }
    );

    // Update user personality data
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'personalityScores.extraversion': scores.extraversion,
        'personalityScores.conscientiousness': scores.conscientiousness,
        'personalityScores.agreeableness': scores.agreeableness,
        'personalityScores.openness': scores.openness,
        'personalityScores.emotionalStability': scores.emotionalStability,
        'personalityScores.personalityType': personalityType,
        profileCompletion: Math.min(100, (req.user.profileCompletion || 40) + 15),
      }
    });

    // Background: regenerate match pool with personality weights
    generateMatchPool(req.user._id).catch(() => {});

    return success(res, { data: { scores, personalityType } }, 'Personality test completed! 🧠');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/personality/result
const getResult = async (req, res) => {
  try {
    const result = await PersonalityResult.findOne({ user: req.user._id });
    if (!result) return error(res, 'No personality test result found. Please complete the test.', 404);
    return success(res, { data: { result } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { getQuestions, submitTest, getResult };
