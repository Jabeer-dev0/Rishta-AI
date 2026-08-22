/**
 * Face Match Service — OpenAI vision (pay-as-you-go).
 * Compares a stored profile photo against a live selfie.
 */

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Helper to fetch an image from URL and build an OpenAI image_url part
 */
async function fetchImagePart(url, label) {
  const axios = require('axios');
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    return {
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${Buffer.from(response.data).toString('base64')}`,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch ${label} from ${url}:`, error.message);
    throw new Error('Could not download image for verification');
  }
}

/**
 * Compare two image URLs using OpenAI vision
 * @param {string} profileImageUrl - URL of existing profile photo
 * @param {string} selfieImageUrl  - URL of captured selfie
 * @returns {{ verified: boolean, similarity: number, message: string }}
 */
const compareFaces = async (profileImageUrl, selfieImageUrl) => {
  if (!profileImageUrl || !selfieImageUrl) {
    return { verified: false, similarity: 0, message: 'Both images are required' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      verified: false,
      similarity: 0,
      message: 'Verification is not configured (missing OPENAI_API_KEY).',
    };
  }

  try {
    const [profileImg, selfieImg] = await Promise.all([
      fetchImagePart(profileImageUrl, 'profile photo'),
      fetchImagePart(selfieImageUrl, 'selfie'),
    ]);

    const prompt = `
You are a high-security identity verification system.
Analyze these two images:
Image 1: The user's stored profile photo.
Image 2: A live selfie captured just now for verification.

Your task:
1. Determine if both images contain exactly the same person.
2. Check if the profile photo (Image 1) is a real human photo or something else (like a meme, cartoon, or object).
3. Provide a similarity score between 0 and 100.
4. Provide a brief explanation.

Return the result ONLY as a JSON object with this exact format:
{
  "verified": boolean,
  "similarity": number,
  "isRealHuman": boolean,
  "explanation": "string"
}`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              profileImg,
              selfieImg,
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`OpenAI API error ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data.choices[0].message.content.trim().replace(/```json|```/g, '');
    const parsed = JSON.parse(text);

    // Final logic: Must be a real human AND similarity >= 75
    const isVerified = parsed.verified && parsed.isRealHuman && parsed.similarity >= 75;

    return {
      verified: isVerified,
      similarity: parsed.similarity,
      message: parsed.explanation || (isVerified ? 'Identity verified successfully' : 'Verification failed'),
    };
  } catch (err) {
    console.error('[OpenAIFaceMatch] Error:', err.message);

    // If quota exceeded or other error, do NOT verify the user
    return {
      verified: false,
      similarity: 0,
      message: err.message.includes('quota')
        ? 'Verification system busy. Please try again in a few minutes.'
        : 'Verification system error. Please try again later.',
    };
  }
};

module.exports = { compareFaces };
