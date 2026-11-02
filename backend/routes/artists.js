const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const auth = require('../middleware/auth');

// POST /api/artists/submit — any logged-in user can submit an artist
router.post('/submit', auth, async (req, res) => {
  try {
    const { name, bio, genre, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const artist = new Artist({ name, bio, genre, email, submittedBy: req.user.id });
    await artist.save();
    res.status(201).json({ message: 'Artist submitted for review', artist });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/artists/approved — public list of approved artists
router.get('/approved', async (req, res) => {
  try {
    const artists = await Artist.find({ status: 'approved' }).sort({ name: 1 });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
