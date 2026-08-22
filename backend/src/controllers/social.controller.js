const User = require('../models/User.model');
const { success, error } = require('../utils/response.utils');
const { generateMatchPool } = require('../services/matchEngine.service');

// Mock social analysis (replace with real OAuth + Gemini pipeline)
const analyzeSocialData = (platform) => ({
  detectedInterests: ['Travel', 'Food Photography', 'Reading', 'Technology', 'Fashion'],
  lifestyleScore: parseFloat((7 + Math.random() * 2).toFixed(1)),
  matchImprovement: Math.floor(15 + Math.random() * 15),
  dataPoints: Math.floor(200 + Math.random() * 200),
});

// GET /api/social/:platform/oauth-url
const getOAuthUrl = async (req, res) => {
  const { platform } = req.params;
  const urls = {
    instagram: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code&state=${req.user._id}`,
    facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=public_profile,user_likes&state=${req.user._id}`,
    twitter: `https://twitter.com/i/oauth2/authorize?client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${process.env.TWITTER_REDIRECT_URI}&scope=tweet.read+users.read&response_type=code&state=${req.user._id}&code_challenge=challenge&code_challenge_method=plain`,
  };
  if (!urls[platform]) return error(res, 'Invalid platform.', 400);
  return success(res, { data: { url: urls[platform] } });
};

// GET /api/social/:platform/callback  (OAuth redirect handler)
const handleCallback = async (req, res) => {
  try {
    const { platform } = req.params;
    const { state: userId } = req.query;

    // Run social analysis (mock — replace with real API calls)
    const insights = analyzeSocialData(platform);

    await User.findByIdAndUpdate(userId, {
      $set: {
        [`socialMediaConnected.${platform}`]: true,
        'socialInsights.detectedInterests': insights.detectedInterests,
        'socialInsights.lifestyleScore': insights.lifestyleScore,
        'socialInsights.matchImprovement': insights.matchImprovement,
        'socialInsights.dataPoints': insights.dataPoints,
      }
    });

    // Regenerate matches with social signals
    generateMatchPool(userId).catch(() => {});

    // Redirect to frontend social media page with success
    res.redirect(`${process.env.FRONTEND_URL}/app/social-media?connected=${platform}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/app/social-media?error=true`);
  }
};

// POST /api/social/analyze (manual trigger for demo/testing)
const analyzePlatform = async (req, res) => {
  try {
    const { platform } = req.body;
    if (!['instagram', 'facebook', 'twitter'].includes(platform)) return error(res, 'Invalid platform.', 400);

    const isConnected = req.user.socialMediaConnected?.[platform];
    if (!isConnected) return error(res, `${platform} is not connected.`, 400);

    const insights = analyzeSocialData(platform);
    await User.findByIdAndUpdate(req.user._id, { $set: { socialInsights: insights } });

    return success(res, { data: { insights } }, `${platform} analyzed successfully!`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// POST /api/social/disconnect/:platform
const disconnect = async (req, res) => {
  try {
    const { platform } = req.params;
    if (!['instagram', 'facebook', 'twitter'].includes(platform)) return error(res, 'Invalid platform.', 400);

    await User.findByIdAndUpdate(req.user._id, {
      $set: { [`socialMediaConnected.${platform}`]: false }
    });

    return success(res, {}, `${platform} disconnected successfully`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET /api/social/insights
const getInsights = async (req, res) => {
  return success(res, { data: { insights: req.user.socialInsights, connected: req.user.socialMediaConnected } });
};

module.exports = { getOAuthUrl, handleCallback, analyzePlatform, disconnect, getInsights };
