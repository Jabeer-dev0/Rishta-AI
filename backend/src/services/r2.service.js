/**
 * Cloudflare R2 object storage service.
 * Uses the same Cloudflare API token as D1 (needs "Workers R2 Storage: Edit").
 * Public reads go through the bucket's r2.dev base URL.
 */

const crypto = require('crypto');

const accountId = () => process.env.CLOUDFLARE_ACCOUNT_ID;
const bucket = () => process.env.CLOUDFLARE_R2_BUCKET || 'rishtaai';
const apiToken = () => process.env.CLOUDFLARE_D1_API_TOKEN;
const publicBase = () => (process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

/** Build a safe object key: folder/userId-timestamp-rand.ext */
const buildKey = (folder, ext = 'jpg') => {
  const stamp = Date.now();
  const rand = crypto.randomBytes(6).toString('hex');
  return `${folder.replace(/^\/+|\/+$/g, '')}/${stamp}-${rand}.${String(ext).replace(/[^a-z0-9]/gi, '')}`;
};

/**
 * Upload a Buffer to R2.
 * @param {Buffer|string} body - raw bytes
 * @param {string} key - object key (e.g. profiles/abc123-1699.jpg)
 * @param {string} contentType - e.g. image/jpeg
 * @returns {{ key: string, url: string }}
 */
const uploadObject = async (body, key, contentType = 'image/jpeg') => {
  if (!accountId() || !apiToken()) {
    throw new Error('R2 not configured: missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_API_TOKEN.');
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId()}/r2/buckets/${bucket()}/objects/${encodeURIComponent(key)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiToken()}`,
        'Content-Type': contentType,
      },
      body: body,
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`R2 upload failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  return { key, url: publicUrl(key) };
};

/** Public URL for an object key (via r2.dev). */
const publicUrl = (key) => {
  const base = publicBase();
  if (!base) throw new Error('R2 not configured: missing CLOUDFLARE_R2_PUBLIC_BASE_URL.');
  return `${base}/${key}`;
};

module.exports = { uploadObject, publicUrl, buildKey };
