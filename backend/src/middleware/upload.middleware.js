const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

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

/**
 * Generic upload to Cloudinary using stream
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Cloudinary upload options
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const { Readable } = require('stream');

    const uploadOptions = {
      folder: 'rishtaai/general',
      resource_type: 'image',
      secure: true,
      ...options,
      // Pass credentials explicitly to ensure they are used for signing
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Detailed Upload Error:', JSON.stringify(error, null, 2));
          return reject(error);
        }
        resolve(result);
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(cld_upload_stream);
  });
};

// Upload CNIC to private folder
const uploadCnicToCloudinary = (buffer) =>
  uploadToCloudinary(buffer, {
    folder: 'rishtaai/cnic_private',
  });

// Upload selfie/profile photo
const uploadPhotoToCloudinary = (buffer) =>
  uploadToCloudinary(buffer, {
    folder: 'rishtaai/profiles',
  });

module.exports = { 
  uploadSingle, 
  uploadDocs, 
  uploadToCloudinary, 
  uploadCnicToCloudinary, 
  uploadPhotoToCloudinary 
};
