const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

// GET /api/playlists
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.id })
      .populate({ path: 'songs', select: '_id title artist genre duration audioUrl coverImage plays likes featured' });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/playlists/public
router.get('/public', async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true }).populate('owner', 'username').populate('songs').limit(10);
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/playlists
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const playlist = new Playlist({ name, description, owner: req.user.id, isPublic: isPublic !== false });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/playlists/:id/songs
router.post('/:id/songs', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const { songId } = req.body;
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    // Populate songs so frontend gets full Song objects (including audioUrl)
    await playlist.populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/playlists/:id/songs/:songId
router.delete('/:id/songs/:songId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    playlist.songs.pull(req.params.songId);
    await playlist.save();
    res.json({ message: 'Song removed from playlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/playlists/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;