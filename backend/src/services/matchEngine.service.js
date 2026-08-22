/**
 * Match Engine Service
 * Computes weighted compatibility score between two users.
 * All logic is local — no external API calls.
 */

const WEIGHTS = {
  personality: 0.25,
  interests: 0.15,
  zodiac: 0.15, // New: Star/Zodiac compatibility
  religion: 0.15,
  education: 0.10,
  city: 0.10,
  profession: 0.10,
};

/** Jaccard similarity between two string arrays */
const jaccardSimilarity = (a = [], b = []) => {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : (intersection / union) * 100;
};

/** Big Five overlap (Euclidean proximity → percentage) */
const personalityCompatibility = (scoresA = {}, scoresB = {}) => {
  const traits = ['extraversion', 'conscientiousness', 'agreeableness', 'openness', 'emotionalStability'];
  const validTraits = traits.filter(t => scoresA[t] != null && scoresB[t] != null);
  if (!validTraits.length) return 60; // default neutral score

  const sumSquaredDiff = validTraits.reduce((sum, t) => {
    const diff = (scoresA[t] - scoresB[t]) / 100;
    return sum + diff * diff;
  }, 0);
  const maxDistance = Math.sqrt(validTraits.length);
  const distance = Math.sqrt(sumSquaredDiff);
  return Math.round((1 - distance / maxDistance) * 100);
};

/** Education level proximity */
const EDUCATION_LEVELS = [
  'Matric', 'Intermediate', 'Bachelor', 'Masters', 'PhD', 'Other',
];
const educationScore = (a = '', b = '') => {
  const ia = EDUCATION_LEVELS.findIndex(e => a.toLowerCase().includes(e.toLowerCase()));
  const ib = EDUCATION_LEVELS.findIndex(e => b.toLowerCase().includes(e.toLowerCase()));
  if (ia === -1 || ib === -1) return 60;
  const diff = Math.abs(ia - ib);
  return Math.max(100 - diff * 20, 20);
};

/** Determine Zodiac Sign from DOB */
const getZodiacSign = (dob) => {
  if (!dob) return null;
  const date = new Date(dob);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return null;
};

/** Zodiac Compatibility Score (simplified high-level logic) */
const zodiacCompatibility = (signA, signB) => {
  if (!signA || !signB) return 50;
  
  const compatibilityMap = {
    'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'],
    'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'],
    'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo', 'Sagittarius'],
    'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo', 'Capricorn'],
    'Leo': ['Aries', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'],
    'Virgo': ['Taurus', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'],
    'Libra': ['Gemini', 'Aquarius', 'Aries', 'Leo', 'Sagittarius'],
    'Scorpio': ['Cancer', 'Pisces', 'Taurus', 'Virgo', 'Capricorn'],
    'Sagittarius': ['Aries', 'Leo', 'Gemini', 'Libra', 'Aquarius'],
    'Capricorn': ['Taurus', 'Virgo', 'Cancer', 'Scorpio', 'Pisces'],
    'Aquarius': ['Gemini', 'Libra', 'Aries', 'Leo', 'Sagittarius'],
    'Pisces': ['Cancer', 'Scorpio', 'Taurus', 'Virgo', 'Capricorn'],
  };

  if (signA === signB) return 80;
  if (compatibilityMap[signA]?.includes(signB)) return 95;
  return 40;
};

/**
 * Main scoring function
 * @returns {number} 0-100 compatibility score
 */
const computeCompatibilityScore = (userA, userB) => {
  const scores = {
    personality: personalityCompatibility(
      userA.personalityScores,
      userB.personalityScores,
    ),
    interests: jaccardSimilarity(userA.interests, userB.interests),
    religion: userA.religion?.toLowerCase() === userB.religion?.toLowerCase() ? 100 : 30,
    education: educationScore(userA.education, userB.education),
    zodiac: zodiacCompatibility(getZodiacSign(userA.dateOfBirth), getZodiacSign(userB.dateOfBirth)),
    city: userA.city?.toLowerCase() === userB.city?.toLowerCase() ? 100 : 40,
    profession: jaccardSimilarity(
      [userA.profession],
      [userB.profession],
    ),
    social: (userA.socialInsights?.lifestyleScore && userB.socialInsights?.lifestyleScore)
      ? Math.max(100 - Math.abs(userA.socialInsights.lifestyleScore - userB.socialInsights.lifestyleScore) * 10, 20)
      : 55,
  };

  const total = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + (scores[key] || 0) * weight;
  }, 0);

  return Math.round(Math.min(Math.max(total, 10), 99));
};

/**
 * Generate match reasons based on scoring breakdown
 */
const generateMatchReasons = (userA, userB) => {
  const reasons = [];
  if (userA.religion?.toLowerCase() === userB.religion?.toLowerCase()) {
    reasons.push(`Both practice ${userA.religion}`);
  }
  const sharedInterests = (userA.interests || []).filter(i =>
    (userB.interests || []).map(x => x.toLowerCase()).includes(i.toLowerCase())
  );
  if (sharedInterests.length > 0) {
    reasons.push(`Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
  }
  if (userA.city?.toLowerCase() === userB.city?.toLowerCase()) {
    reasons.push(`Both based in ${userA.city}`);
  }
  const personalityScore = personalityCompatibility(userA.personalityScores, userB.personalityScores);
  if (personalityScore >= 75) {
    reasons.push('Highly compatible personality traits');
  }
  const signA = getZodiacSign(userA.dateOfBirth);
  const signB = getZodiacSign(userB.dateOfBirth);
  if (zodiacCompatibility(signA, signB) >= 90) {
    reasons.push(`Perfect Zodiac harmony (${signA} & ${signB})`);
  }
  if (reasons.length < 2) {
    reasons.push('Similar educational and professional backgrounds');
  }
  return reasons.slice(0, 4);
};

/**
 * Filter candidates: opposite gender, age preference, not blocked/self
 */
const filterCandidates = (currentUser, candidates) => {
  const oppositeGender = currentUser.gender === 'Male' ? 'Female' : 'Male';
  const { min = 18, max = 70 } = currentUser.partnerPreferences?.ageRange || {};
  const blocked = new Set((currentUser.blockedUsers || []).map(id => id.toString()));

  return candidates.filter(candidate => {
    if (candidate._id.toString() === currentUser._id.toString()) return false;
    if (candidate.gender !== oppositeGender) return false;
    if (candidate.age < min || candidate.age > max) return false;
    if (blocked.has(candidate._id.toString())) return false;
    if (!candidate.isActive || candidate.isBlocked) return false;
    return true;
  });
};

/**
 * Generate a pool of matches for a user
 */
const generateMatchPool = async (userId) => {
  const User = require('../models/User.model');
  const Match = require('../models/Match.model');

  const currentUser = await User.findById(userId);
  if (!currentUser) return;

  // Find all potential candidates
  const rows = await User.queryRows(
    "SELECT * FROM users WHERE id != ? AND is_active = 1 AND role = 'user' AND is_blocked = 0",
    [userId]
  );
  const candidates = rows.map(User.mapUser);
  const filtered = filterCandidates(currentUser, candidates);

  for (const candidate of filtered) {
    const score = computeCompatibilityScore(currentUser, candidate);
    const reasons = generateMatchReasons(currentUser, candidate);
    await Match.upsertOne({
      userId,
      matchedUserId: candidate._id,
      compatibilityScore: score,
      matchReasons: reasons,
    });
  }
};

module.exports = {
  computeCompatibilityScore,
  generateMatchReasons,
  filterCandidates,
  personalityCompatibility,
  jaccardSimilarity,
  generateMatchPool,
};
