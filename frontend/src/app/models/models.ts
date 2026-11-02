export interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  audioUrl: string;
  coverImage: string;
  likes: number;
  plays: number;
  releaseYear: number;
  featured: boolean;
  createdAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  owner: string;
  songs: Song[];
  coverImage: string;
  isPublic: boolean;
  createdAt: string;
}

export interface User {
  _id: string;   // MongoDB always returns _id
  id: string;    // virtual alias (populated by auth service)
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  likedSongs?: Song[];
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Artist {
  _id: string;
  name: string;
  bio: string;
  genre: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: { username: string; email: string };
  reviewNote?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalSongs: number;
  totalPlaylists: number;
  pendingArtists: number;
  totalPlays: number;
  totalLikes: number;
  recentUsers: User[];
  topSongs: Song[];
}
