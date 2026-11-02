const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const audioDir = path.join(__dirname, '../uploads/audio');
const imageDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Storage config for audio files
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'audio-' + unique + ext);
  }
});

// Storage config for image files
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'cover-' + unique + ext);
  }
});

// File filter — only allow audio types
const audioFilter = (req, file, cb) => {
  const allowed = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (MP3, WAV, OGG, FLAC, AAC, M4A)'), false);
  }
};

// File filter — only allow image types
const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPG, PNG, WebP, GIF)'), false);
  }
};

// Upload handlers
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Combined: upload both audio and image in one request
const uploadSongFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'audio') cb(null, audioDir);
      else cb(null, imageDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      const ext = path.extname(file.originalname).toLowerCase();
      const prefix = file.fieldname === 'audio' ? 'audio-' : 'cover-';
      cb(null, prefix + unique + ext);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

module.exports = { uploadAudio, uploadImage, uploadSongFiles };
