const { GoogleGenAI } = require('@google/genai');

let genAI;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
};

/**
 * Generate a compatibility report between two users using Gemini
 */
const generateCompatibilityReport = async (userA, userB) => {
  // If no API key, return a mock report for development
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    return generateMockReport(userA, userB);
  }

  try {
    const client = getGenAI();

    const prompt = `
You are a matrimonial compatibility expert. Analyze these two people and generate a compatibility report.

Person A:
- Name: ${userA.name}
- Age: ${userA.age}, Gender: ${userA.gender}
- City: ${userA.city}, Religion: ${userA.religion}
- Education: ${userA.education}, Profession: ${userA.profession}
- Interests: ${(userA.interests || []).join(', ')}
- Family Background: ${userA.familyBackground || 'Not specified'}
- Personality: ${JSON.stringify(userA.personalityScores || {})}

Person B:
- Name: ${userB.name}
- Age: ${userB.age}, Gender: ${userB.gender}
- City: ${userB.city}, Religion: ${userB.religion}
- Education: ${userB.education}, Profession: ${userB.profession}
- Interests: ${(userB.interests || []).join(', ')}
- Family Background: ${userB.familyBackground || 'Not specified'}
- Personality: ${JSON.stringify(userB.personalityScores || {})}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "compatibilityScore": <number 0-100>,
  "personalityMatch": <number 0-100>,
  "lifestyleCompatibility": <number 0-100>,
  "emotionalCompatibility": <number 0-100>,
  "longTermStability": <number 0-100>,
  "strengths": ["<string>", "<string>", "<string>"],
  "potentialHurdles": ["<string>", "<string>"],
  "matchReasons": ["<string>", "<string>", "<string>"],
  "report": "<150-word narrative paragraph about their compatibility>"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }]
    });

    const text = response.text.trim();

    // Extract JSON even if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[AIService] Gemini error:', err.message);
    return generateMockReport(userA, userB);
  }
};

/**
 * Generate "Why this match?" explanation
 */
const generateWhyThisMatch = async (userA, userB) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    return [
      `Both share ${userA.religion} values`,
      `Similar educational backgrounds`,
      `Complementary interests: ${(userA.interests || []).slice(0, 2).join(', ')}`,
    ];
  }

  try {
    const client = getGenAI();
    const prompt = `
In 3 short bullet points (max 15 words each), explain why ${userA.name} and ${userB.name} are a good matrimonial match.
${userA.name}: ${userA.religion}, ${userA.profession}, from ${userA.city}, interests: ${(userA.interests || []).join(', ')}
${userB.name}: ${userB.religion}, ${userB.profession}, from ${userB.city}, interests: ${(userB.interests || []).join(', ')}
Return ONLY a JSON array of 3 strings.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }]
    });

    const text = response.text.trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return text.split('\n').filter(Boolean).slice(0, 3);
  } catch {
    return [`Shared ${userA.religion} values`, 'Compatible backgrounds', 'Overlapping interests'];
  }
};

/** Fallback mock report for development without API key */
const generateMockReport = (userA, userB) => {
  const score = Math.floor(Math.random() * 30) + 65;
  return {
    compatibilityScore: score,
    personalityMatch: Math.floor(Math.random() * 20) + 70,
    lifestyleCompatibility: Math.floor(Math.random() * 20) + 65,
    emotionalCompatibility: Math.floor(Math.random() * 20) + 68,
    longTermStability: Math.floor(Math.random() * 20) + 67,
    strengths: [
      `Both value ${userA.religion} traditions and family`,
      `Complementary professions — ${userA.profession} & ${userB.profession}`,
      `Shared interests in ${(userA.interests || ['learning'])[0]}`,
    ],
    potentialHurdles: [
      userA.city !== userB.city ? `Different cities may require relocation discussion` : 'Minor lifestyle adjustments',
      'Different family expectations may need alignment',
    ],
    matchReasons: [
      `Both are ${userA.religion} with strong family values`,
      `Highly compatible personality profiles`,
      `Shared interests: ${(userA.interests || []).slice(0, 2).join(', ')}`,
    ],
    graphData: {
      personality: Math.floor(Math.random() * 20) + 70,
      lifestyle: Math.floor(Math.random() * 20) + 65,
      emotional: Math.floor(Math.random() * 20) + 68,
      values: Math.floor(Math.random() * 20) + 75,
    },
    report: `${userA.name} and ${userB.name} share a strong foundation of ${userA.religion} values and complementary backgrounds. Their shared interests in ${(userA.interests || ['family and community'])[0]} suggest natural conversation topics and lifestyle compatibility. While they come from different cities, their shared values and professional respect for each other's careers indicate long-term potential. Their personality profiles suggest a balanced dynamic with room for both individual growth and shared experiences. This match holds genuine promise for a meaningful partnership.`,
  };
};

/**
 * Evaluate compatibility for guest users (Form or File)
 */
const evaluateGuestCompatibility = async (dataA, dataB, files = {}) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    return generateMockReport(dataA, dataB);
  }

  try {
    const client = getGenAI();

    const contents = [
      {
        text: `You are a matrimonial compatibility expert. Analyze these two guest users and generate a detailed compatibility report. 
      Data can come from either form fields or attached documents. 
      
      Compare them based on:
      1. Personality & Values
      2. Education & Career
      3. Lifestyle & Interests
      4. Long-term Stability
      
      Return ONLY valid JSON (no markdown) with this structure:
      {
        "status": "Completely" | "Future" | "Risk",
        "compatibilityScore": <0-100>,
        "report": "<Detailed paragraph, strictly 4-5 lines max>",
        "strengths": ["...", "..."],
        "risks": ["...", "..."],
        "verdict": "A summary sentence",
        "graphData": {
          "personality": <0-100>,
          "lifestyle": <0-100>,
          "emotional": <0-100>,
          "values": <0-100>
        }
      }` }
    ];

    // Handle Person A
    if (files.fileA) {
      contents.push({ text: "Person A Document:" });
      contents.push({
        inlineData: {
          data: files.fileA[0].buffer.toString('base64'),
          mimeType: files.fileA[0].mimetype
        }
      });
    } else {
      contents.push({ text: `Person A Form Data: ${JSON.stringify(dataA)}` });
    }

    // Handle Person B
    if (files.fileB) {
      contents.push({ text: "Person B Document:" });
      contents.push({
        inlineData: {
          data: files.fileB[0].buffer.toString('base64'),
          mimeType: files.fileB[0].mimetype
        }
      });
    } else {
      contents.push({ text: `Person B Form Data: ${JSON.stringify(dataB)}` });
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents
    });

    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[AIService] Guest Compatibility error:', err);
    return {
      status: 'Future',
      compatibilityScore: 75,
      report: 'We encountered an error analyzing your data, but based on common patterns, you show potential for a strong future together. We recommend focusing on shared values.',
      strengths: ['Shared goals', 'Educational background'],
      risks: ['Communication styles'],
      verdict: 'Good potential with some effort.'
    };
  }
};

/**
 * Generate celestial compatibility insight based on Zodiac signs
 */
const generateStarInsight = async (userA, userB) => {
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

  const signA = getZodiacSign(userA.dateOfBirth);
  const signB = getZodiacSign(userB.dateOfBirth);

  if (!signA || !signB) return "Celestial data incomplete for this pair.";

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    return `As a ${signA}, ${userA.name} shares a natural cosmic harmony with ${userB.name}, who is a ${signB}. Their stars align to create a balanced and meaningful connection.`;
  }

  try {
    const client = getGenAI();
    const prompt = `
You are an expert astrologer and matrimonial counselor. Analyze the celestial compatibility between these two people based on their Zodiac signs.

Person 1: ${userA.name} (${signA})
Person 2: ${userB.name} (${signB})

Generate a poetic and insightful 2-sentence "Celestial Insight" about their compatibility. Focus on how their signs complement each other. Avoid generic horoscopes.

Return ONLY the text.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }]
    });

    return response.text.trim();
  } catch (err) {
    return `The alignment between ${signA} and ${signB} suggests a unique journey of shared growth and mutual understanding.`;
  }
};

module.exports = {
  generateCompatibilityReport,
  generateWhyThisMatch,
  evaluateGuestCompatibility,
  generateStarInsight
};
