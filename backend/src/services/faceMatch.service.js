const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

/**
 * Face Match Service using the NEW @google/genai SDK
 */

// Initialize the NEW Gemini SDK
// It automatically picks up GEMINI_API_KEY from process.env if available,
// but we'll be explicit to ensure compatibility.
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Helper to fetch image from URL and convert to Gemini format
 */
async function fetchImageForGemini(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    return {
      inlineData: {
        data: Buffer.from(response.data).toString('base64'),
        mimeType
      }
    };
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error.message);
    throw new Error('Could not download image for verification');
  }
}

/**
 * Compare two image URLs using Gemini 2.5 Flash (via @google/genai)
 * @param {string} profileImageUrl - URL of existing profile photo
 * @param {string} selfieImageUrl  - URL of captured selfie
 * @returns {{ verified: boolean, similarity: number, message: string }}
 */
const compareFaces = async (profileImageUrl, selfieImageUrl) => {
  if (!profileImageUrl || !selfieImageUrl) {
    return { verified: false, similarity: 0, message: 'Both images are required' };
  }

  try {
    const [profileImg, selfieImg] = await Promise.all([
      fetchImageForGemini(profileImageUrl),
      fetchImageForGemini(selfieImageUrl)
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
      }
    `;

    // Using the NEW @google/genai SDK syntax
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', // Using 2.5 Flash as the standard stable target
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            profileImg,
            selfieImg
          ]
        }
      ]
    });

    const text = response.text;

    // Parse the JSON from Gemini's response
    const cleanText = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanText);

    // Final logic: Must be a real human AND similarity >= 75
    const isVerified = data.verified && data.isRealHuman && data.similarity >= 75;

    return {
      verified: isVerified,
      similarity: data.similarity,
      message: data.explanation || (isVerified ? 'Identity verified successfully' : 'Verification failed')
    };

  } catch (err) {
    console.error('[GenAIFaceMatch] Error:', err.message);

    // If quota exceeded or other error, do NOT verify the user
    return {
      verified: false,
      similarity: 0,
      message: err.message.includes('quota')
        ? 'Verification system busy. Please try again in a few minutes.'
        : 'Verification system error. Please try again later.'
    };
  }
};

module.exports = { compareFaces };
