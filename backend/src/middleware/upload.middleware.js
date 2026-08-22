const multer = require('multer');
const { uploadObject, buildKey } = require('../services/r2.service');

const memoryStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const docFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, and Text files are allowed'), false);
  }
};

// Generic single-file upload to memory
const uploadSingle = (fieldName) => multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
}).single(fieldName);

// Multiple files for compatibility checker (Form A and Form B)
const uploadDocs = multer({
  storage: memoryStorage,
  fileFilter: docFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).fields([
  { name: 'fileA', maxCount: 1 },
  { name: 'fileB', maxCount: 1 }
]);

// CNIC front + back images for identity verification
const uploadCnicFields = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
}).fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 }
]);

// Full registration package: profile photo + CNIC front/back + live selfie
const uploadRegisterFields = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]);

/** Ext from mimetype (jpeg/png/webp/...), fallback jpg */
const extFromMime = (mime) => {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  return map[mime] || 'jpg';
};

/**
 * Upload an image buffer to R2. Returns { key, secure_url } so existing
 * controllers keep working without changes.
 */
const uploadImageToR2 = async (buffer, folder, contentType = 'image/jpeg') =>
  uploadObject(buffer, buildKey(folder, extFromMime(contentType)), contentType);

// Upload CNIC scan (private-ish folder in the same bucket)
const uploadCnicToCloudinary = async (buffer, contentType = 'image/jpeg') => {
  const r = await uploadImageToR2(buffer, 'rishtaai/cnic_private', contentType);
  return { ...r, secure_url: r.url };
};

// Upload selfie/profile photo
const uploadPhotoToCloudinary = async (buffer, contentType = 'image/jpeg') => {
  const r = await uploadImageToR2(buffer, 'rishtaai/profiles', contentType);
  return { ...r, secure_url: r.url };
};

module.exports = {
  uploadSingle,
  uploadDocs,
  uploadCnicFields,
  uploadRegisterFields,
  uploadCnicToCloudinary,
  uploadPhotoToCloudinary
};
