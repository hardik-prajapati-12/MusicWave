const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { uploadSongFiles } = require('../middleware/upload');

// POST /api/upload/song-files
// Uploads audio and/or image files, returns their accessible URLs
// Requires auth + admin role
router.post('/song-files', auth, admin, (req, res) => {
  uploadSongFiles(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const result = {};
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (req.files && req.files['audio'] && req.files['audio'][0]) {
      const audioFile = req.files['audio'][0];
      result.audioUrl = `${baseUrl}/uploads/audio/${audioFile.filename}`;
    }

    if (req.files && req.files['image'] && req.files['image'][0]) {
      const imageFile = req.files['image'][0];
      result.coverImage = `${baseUrl}/uploads/images/${imageFile.filename}`;
    }

    if (!result.audioUrl && !result.coverImage) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    res.json(result);
  });
});

// DELETE /api/upload/file — delete a specific uploaded file
router.delete('/file', auth, admin, (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ message: 'filePath required' });

    // Only allow deleting files inside the uploads folder for security
    const uploadsDir = path.join(__dirname, '../uploads');
    const fileName = path.basename(filePath);

    // Try audio folder first, then images
    let fullPath = path.join(uploadsDir, 'audio', fileName);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(uploadsDir, 'images', fileName);
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      res.json({ message: 'File deleted' });
    } else {
      res.json({ message: 'File not found (already deleted)' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
