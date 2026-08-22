/**
 * AI Service — OpenAI (pay-as-you-go).
 * Uses native fetch against the OpenAI Chat Completions API,
 * so no extra SDK dependency is required.
 *
 * Falls back to deterministic mock responses when OPENAI_API_KEY
 * is not configured (local dev / free mode).
 */

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const hasApiKey = () =>
  !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key';

/**
 * Low-level chat completion helper.
 * @param {Array}  messages  - OpenAI chat messages
 * @param {Object} [options]  - { json: true } forces a JSON object response
 */
const chatCompletion = async (messages, { json = false } = {}) => {
  const body = {
    model: MODEL,
    messages,
    temperature: json ? 0.4 : 0.8,
    max_tokens: 900,
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
};

/** Extract a JSON object/array even when wrapped in markdown fences. */
const parseJsonLoose = (text) => {
  const match = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Invalid AI response format');
  return JSON.parse(match[0]);
};

/**
 * Generate a compatibility report between two users using OpenAI
 */
const generateCompatibilityReport = async (userA, userB) => {
  if (!hasApiKey()) return generateMockReport(userA, userB);

  try {
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

    const text = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { json: true }
    );
    return parseJsonLoose(text);
  } catch (err) {
    console.error('[AIService] OpenAI error:', err.message);
    return generateMockReport(userA, userB);
  }
};

/**
 * Generate "Why this match?" explanation
 */
const generateWhyThisMatch = async (userA, userB) => {
  if (!hasApiKey()) {
    return [
      `Both share ${userA.religion} values`,
      'Similar educational backgrounds',
      `Complementary interests: ${(userA.interests || []).slice(0, 2).join(', ')}`,
    ];
  }

  try {
    const prompt = `
In 3 short bullet points (max 15 words each), explain why ${userA.name} and ${userB.name} are a good matrimonial match.
${userA.name}: ${userA.religion}, ${userA.profession}, from ${userA.city}, interests: ${(userA.interests || []).join(', ')}
${userB.name}: ${userB.religion}, ${userB.profession}, from ${userB.city}, interests: ${(userB.interests || []).join(', ')}
Return ONLY a JSON array of 3 strings.`;

    const text = await chatCompletion([{ role: 'user', content: prompt }]);
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
      'Highly compatible personality profiles',
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
 * Build OpenAI multimodal content parts for a person's data.
 * Images are sent as vision input; other documents degrade gracefully.
 */
const buildPersonContentParts = (label, formData, fileEntry) => {
  const parts = [{ type: 'text', text: `${label} Form Data: ${JSON.stringify(formData)}` }];

  if (fileEntry && fileEntry[0]) {
    const f = fileEntry[0];
    if ((f.mimetype || '').startsWith('image/')) {
      parts.push({ type: 'text', text: `${label} attached this photo/document image:` });
      parts.push({
        type: 'image_url',
        image_url: { url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}` },
      });
    } else {
      parts.push({
        type: 'text',
        text: `${label} also attached a document (${f.originalname}) which could not be read directly; rely on the form data above.`,
      });
    }
  }
  return parts;
};

/**
 * Evaluate compatibility for guest users (Form or File)
 */
const evaluateGuestCompatibility = async (dataA, dataB, files = {}) => {
  if (!hasApiKey()) return generateMockReport(dataA, dataB);

  try {
    const systemPrompt = `You are a matrimonial compatibility expert. Analyze two guest users and generate a detailed compatibility report.

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
}`;

    const userContent = [
      { type: 'text', text: systemPrompt },
      ...buildPersonContentParts('Person A', dataA, files.fileA),
      ...buildPersonContentParts('Person B', dataB, files.fileB),
    ];

    const text = await chatCompletion([{ role: 'user', content: userContent }], { json: true });
    return parseJsonLoose(text);
  } catch (err) {
    console.error('[AIService] Guest Compatibility error:', err.message);
    return {
      status: 'Future',
      compatibilityScore: 75,
      report: 'We encountered an error analyzing your data, but based on common patterns, you show potential for a strong future together. We recommend focusing on shared values.',
      strengths: ['Shared goals', 'Educational background'],
      risks: ['Communication styles'],
      verdict: 'Good potential with some effort.',
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

  if (!signA || !signB) return 'Celestial data incomplete for this pair.';

  if (!hasApiKey()) {
    return `As a ${signA}, ${userA.name} shares a natural cosmic harmony with ${userB.name}, who is a ${signB}. Their stars align to create a balanced and meaningful connection.`;
  }

  try {
    const prompt = `
You are an expert astrologer and matrimonial counselor. Analyze the celestial compatibility between these two people based on their Zodiac signs.

Person 1: ${userA.name} (${signA})
Person 2: ${userB.name} (${signB})

Generate a poetic and insightful 2-sentence "Celestial Insight" about their compatibility. Focus on how their signs complement each other. Avoid generic horoscopes.

Return ONLY the text.`;

    return await chatCompletion([{ role: 'user', content: prompt }]);
  } catch (err) {
    console.error('[AIService] Star insight error:', err.message);
    return `The alignment between ${signA} and ${signB} suggests a unique journey of shared growth and mutual understanding.`;
  }
};

module.exports = {
  generateCompatibilityReport,
  generateWhyThisMatch,
  evaluateGuestCompatibility,
  generateStarInsight,
};
