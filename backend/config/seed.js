const Song = require('../models/Song');

const sampleSongs = [
  {
    title: 'Midnight Echoes',
    artist: 'Luna Ray',
    album: 'Stellar Dreams',
    genre: 'Electronic',
    duration: 214,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverImage: 'https://picsum.photos/seed/song1/300/300',
    likes: 1240,
    plays: 45200,
    featured: true,
    releaseYear: 2024
  },
  {
    title: 'Golden Hour',
    artist: 'The Wanderers',
    album: 'Open Roads',
    genre: 'Indie',
    duration: 198,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverImage: 'https://picsum.photos/seed/song2/300/300',
    likes: 980,
    plays: 32100,
    featured: true,
    releaseYear: 2024
  },
  {
    title: 'Neon Lights',
    artist: 'CityScape',
    album: 'Urban Jungle',
    genre: 'Pop',
    duration: 225,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverImage: 'https://picsum.photos/seed/song3/300/300',
    likes: 2100,
    plays: 78400,
    featured: true,
    releaseYear: 2023
  },
  {
    title: 'Blue Jazz',
    artist: 'Marcus Cole',
    album: 'Midnight Sessions',
    genre: 'Jazz',
    duration: 342,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverImage: 'https://picsum.photos/seed/song4/300/300',
    likes: 560,
    plays: 18900,
    featured: false,
    releaseYear: 2023
  },
  {
    title: 'Thunder Road',
    artist: 'Iron Wolves',
    album: 'Storm Rising',
    genre: 'Rock',
    duration: 267,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverImage: 'https://picsum.photos/seed/song5/300/300',
    likes: 3400,
    plays: 112000,
    featured: true,
    releaseYear: 2024
  },
  {
    title: 'Soul Revival',
    artist: 'Destiny Brooks',
    album: 'Rise Up',
    genre: 'R&B',
    duration: 233,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverImage: 'https://picsum.photos/seed/song6/300/300',
    likes: 1870,
    plays: 67300,
    featured: false,
    releaseYear: 2024
  },
  {
    title: 'Street Dreams',
    artist: 'Phantom MC',
    album: 'Underground Kings',
    genre: 'Hip-Hop',
    duration: 195,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverImage: 'https://picsum.photos/seed/song7/300/300',
    likes: 4500,
    plays: 156000,
    featured: true,
    releaseYear: 2024
  },
  {
    title: 'Piano Sonata No. 3',
    artist: 'Vienna Ensemble',
    album: 'Classical Masterworks',
    genre: 'Classical',
    duration: 480,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverImage: 'https://picsum.photos/seed/song8/300/300',
    likes: 720,
    plays: 25600,
    featured: false,
    releaseYear: 2022
  },
  {
    title: 'Desert Rose',
    artist: 'Sahara Wind',
    album: 'Mirage',
    genre: 'Country',
    duration: 218,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverImage: 'https://picsum.photos/seed/song9/300/300',
    likes: 890,
    plays: 31200,
    featured: false,
    releaseYear: 2023
  },
  {
    title: 'Digital Storm',
    artist: 'ByteBreaker',
    album: 'System Override',
    genre: 'Electronic',
    duration: 302,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverImage: 'https://picsum.photos/seed/song10/300/300',
    likes: 2300,
    plays: 89100,
    featured: true,
    releaseYear: 2024
  },
  {
    title: 'Velvet Sky',
    artist: 'Aurora Nights',
    album: 'Dreamscape',
    genre: 'Indie',
    duration: 251,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverImage: 'https://picsum.photos/seed/song11/300/300',
    likes: 1560,
    plays: 54800,
    featured: false,
    releaseYear: 2024
  },
  {
    title: 'Rhythm Nation',
    artist: 'Beat Factory',
    album: 'Pure Vibes',
    genre: 'Hip-Hop',
    duration: 188,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverImage: 'https://picsum.photos/seed/song12/300/300',
    likes: 3100,
    plays: 103000,
    featured: false,
    releaseYear: 2023
  }
];

async function seedDatabase() {
  try {
    const count = await Song.countDocuments();
    if (count === 0) {
      await Song.insertMany(sampleSongs);
      console.log('🎵 Sample songs seeded successfully');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

seedDatabase();