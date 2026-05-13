const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = ['uploads/pdfs', 'uploads/images', 'uploads/documents', 'uploads/avatars'];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mime = file.mimetype;
    let folder = 'uploads/documents';

    if (mime === 'application/pdf') {
      folder = 'uploads/pdfs';
    } else if (mime.startsWith('image/')) {
      folder = 'uploads/images';
    } else if (
      mime.includes('presentation') ||
      mime.includes('powerpoint') ||
      mime.includes('word') ||
      mime.includes('document')
    ) {
      folder = 'uploads/documents';
    }

    // Avatar special case
    if (req.route && req.route.path && req.route.path.includes('avatar')) {
      folder = 'uploads/avatars';
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Supported: PDF, DOC, DOCX, PPT, PPTX, Images'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

module.exports = { upload };
