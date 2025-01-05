const express = require('express');
const multer = require('multer');
const { uploadVideo, trimVideoClip, mergeVideoClips, generateShareableLink, accessShareableLink } = require('../controllers/video.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const path = require('path');
const fs = require('fs');
const { ERROR_MESSAGES } = require('../constants/constants');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../assets/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_VIDEO_FILE_SIZE),
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
    }
  },
});


router.post('/upload', authenticate, upload.single('video'), uploadVideo);

router.post('/trim', authenticate, trimVideoClip);

router.post("/merge", authenticate, mergeVideoClips);

router.post('/share/:videoId', authenticate, generateShareableLink);

router.get('/share/:linkId', accessShareableLink);

module.exports = router;
