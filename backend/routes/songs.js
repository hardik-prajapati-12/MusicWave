const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/songs - Get all songs with optional filters
router.get('/', async (req, res) => {
  try {
    const { genre, search, featured, limit = 20, page = 1, sort = 'plays' } = req.query;
    let query = {};

    if (genre) query.genre = genre;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }

    // Support different sort modes
    let sortObj = {};
    if (sort === 'newest')  sortObj = { createdAt: -1 };
    else if (sort === 'plays') sortObj = { plays: -1 };
    else if (sort === 'likes') sortObj = { likes: -1 };
    else sortObj = { plays: -1 }; // default

    const songs = await Song.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Song.countDocuments(query);
    res.json({ songs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/songs/genres - Get all genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Song.distinct('genre');
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/songs/trending
router.get('/trending', async (req, res) => {
  try {
    const songs = await Song.find().sort({ plays: -1 }).limit(10);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/songs/:id
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/songs/:id/duration — auto-update duration from actual audio metadata
router.patch('/:id/duration', async (req, res) => {
  try {
    const { duration } = req.body;
    if (!duration || duration <= 0 || !isFinite(duration)) {
      return res.status(400).json({ message: 'Invalid duration' });
    }
    const roundedDuration = Math.round(duration);
    await Song.findByIdAndUpdate(req.params.id, { duration: roundedDuration });
    res.json({ message: 'Duration updated', duration: roundedDuration });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/songs/:id/play - Increment play count
router.post('/:id/play', async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } });
    res.json({ message: 'Play count updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/songs/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const songId = req.params.id;
    const isLiked = user.likedSongs.includes(songId);

    if (isLiked) {
      user.likedSongs.pull(songId);
      await Song.findByIdAndUpdate(songId, { $inc: { likes: -1 } });
    } else {
      user.likedSongs.push(songId);
      await Song.findByIdAndUpdate(songId, { $inc: { likes: 1 } });
    }

    await user.save();
    res.json({ liked: !isLiked, message: isLiked ? 'Song unliked' : 'Song liked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;