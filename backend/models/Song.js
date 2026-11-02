const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, default: 'Unknown Album' },
  genre: {
    type: String,
    enum: ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Metal'],
    default: 'Pop'
  },
  duration: { type: Number, default: 180 }, // in seconds
  audioUrl: { type: String, required: true },
  coverImage: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  releaseYear: { type: Number, default: new Date().getFullYear() },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);
