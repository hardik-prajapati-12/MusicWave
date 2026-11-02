const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Serve uploaded files as static assets
// Audio: http://localhost:5000/uploads/audio/filename.mp3
// Images: http://localhost:5000/uploads/images/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/songs',     require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/artists',   require('./routes/artists'));
app.use('/api/upload',    require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'MusicWave API is running 🎵', timestamp: new Date() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    require('./config/seed');
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎵 MusicWave Server running on port ${PORT}`);
  console.log(`📁 Uploads served at http://localhost:${PORT}/uploads`);
});