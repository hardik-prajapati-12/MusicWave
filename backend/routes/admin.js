const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(auth, admin);

// ── DASHBOARD STATS ─────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalSongs, totalPlaylists, pendingArtists, totalPlays, totalLikes] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments(),
      Playlist.countDocuments(),
      Artist.countDocuments({ status: 'pending' }),
      Song.aggregate([{ $group: { _id: null, total: { $sum: '$plays' } } }]),
      Song.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }])
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const topSongs = await Song.find().sort({ plays: -1 }).limit(5);

    res.json({
      totalUsers,
      totalSongs,
      totalPlaylists,
      pendingArtists,
      totalPlays: totalPlays[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      recentUsers,
      topSongs
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── USER MANAGEMENT ─────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin".' });
    }
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Role change error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.put('/users/:id/toggle-active', async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate yourself.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      isActive: user.isActive,
      message: 'User ' + (user.isActive ? 'activated' : 'deactivated') + ' successfully'
    });
  } catch (err) {
    console.error('Toggle active error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── SONG MANAGEMENT ─────────────────────────────────────────
router.get('/songs', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { artist: { $regex: search, $options: 'i' } }
    ];
    const songs = await Song.find(query).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/songs', async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/songs/:id/featured', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    song.featured = !song.featured;
    await song.save();
    res.json({ featured: song.featured, message: `Song ${song.featured ? 'featured' : 'unfeatured'}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/songs/:id/reset-likes', async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { likes: 0 });
    res.json({ message: 'Likes reset to 0' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Delete audio file from disk if it's a local upload
    if (song.audioUrl && song.audioUrl.includes('/uploads/')) {
      const audioPath = require('path').join(__dirname, '../uploads/audio', require('path').basename(song.audioUrl));
      if (require('fs').existsSync(audioPath)) require('fs').unlinkSync(audioPath);
    }

    // Delete cover image from disk if it's a local upload
    if (song.coverImage && song.coverImage.includes('/uploads/')) {
      const imagePath = require('path').join(__dirname, '../uploads/images', require('path').basename(song.coverImage));
      if (require('fs').existsSync(imagePath)) require('fs').unlinkSync(imagePath);
    }

    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song and files deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── ARTIST APPROVAL ─────────────────────────────────────────
router.get('/artists', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const artists = await Artist.find(query).populate('submittedBy', 'username email').sort({ createdAt: -1 });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/artists/:id/approve', async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', reviewedBy: req.user.id, reviewNote: req.body.note || '' },
      { new: true }
    );
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/artists/:id/reject', async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', reviewedBy: req.user.id, reviewNote: req.body.note || '' },
      { new: true }
    );
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/artists/:id', async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;