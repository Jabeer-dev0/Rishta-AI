/**
 * CNIC verification service — OpenAI vision extracts data from the
 * CNIC front image, which is then matched against the user's profile.
 */

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const normalizeCnic = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/** Valid Pakistani CNIC: exactly 13 digits. */
const isValidCnicFormat = (value) => /^\d{13}$/.test(normalizeCnic(value));

/**
 * Extract { cnicNumber, name, dateOfBirth, gender } from a CNIC image.
 * @param {string} base64Image - raw base64 of the front-side photo
 * @param {string} mimeType - e.g. image/jpeg
 */
const extractCnicData = async (base64Image, mimeType) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('CNIC scanning is not configured (missing OPENAI_API_KEY).');
  }

  const prompt = `
You are reading a Pakistani National Identity Card (CNIC).
Extract the following fields from the card image:

- cnicNumber: the 13-digit ID number (may be printed as 00000-0000000-0). Digits only.
- name: the full holder name in English as printed.
- dateOfBirth: the date of birth printed on the card. Format it strictly as YYYY-MM-DD. If only a Hijri/other format is visible, give your best Gregorian estimate.
- gender: "Male" or "Female".

Return ONLY a JSON object:
{
  "cnicNumber": string,
  "name": string,
  "dateOfBirth": string,
  "gender": string
}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI vision error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content.trim());
  return {
    cnicNumber: normalizeCnic(parsed.cnicNumber),
    name: (parsed.name || '').trim(),
    dateOfBirth: (parsed.dateOfBirth || '').trim(),
    gender: (parsed.gender || '').trim(),
  };
};

/** Simple token-overlap name similarity (0..1), tolerant of order/case. */
const compareNames = (a, b) => {
  if (!a || !b) return 0;
  const norm = (s) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const tokensA = new Set(norm(a));
  const tokensB = new Set(norm(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  tokensA.forEach((t) => { if (tokensB.has(t)) overlap += 1; });
  return overlap / Math.max(tokensA.size, tokensB.size);
};

/** Compare DOBs by calendar date, tolerant of formatting differences. */
const compareDates = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

module.exports = { extractCnicData, isValidCnicFormat, normalizeCnic, compareNames, compareDates };
