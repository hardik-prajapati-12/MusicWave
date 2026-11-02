# 🎵 MusicWave — MEAN Stack Music Website (v2)

A beginner-level full-stack music streaming website built with the MEAN Stack:
- **M**ongoDB — Database
- **E**xpress.js — Backend REST API
- **A**ngular 17 — Frontend SPA
- **N**ode.js — Runtime

---

## 🆕 What's New in v2

- ✅ **Layout fixed** — Navbar, sidebar, player and content now each occupy their own fixed zone; nothing overlaps
- ✅ **User roles** — `user` and `admin` roles with full role-based access control
- ✅ **Admin Panel** — Full control centre at `/admin` (admin-only)
- ✅ **Artist Approval** — Submit and approve/reject artist applications
- ✅ **Default admin account** auto-seeded on first run

---

## 🔑 Default Accounts

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@musicwave.com      | admin123   |
| User  | Register at /register    | (your own) |

---

## 📁 Project Structure

```
musicwave/
├── backend/
│   ├── models/         User.js · Song.js · Playlist.js · Artist.js
│   ├── routes/         auth.js · songs.js · playlists.js · users.js · admin.js · artists.js
│   ├── middleware/     auth.js (JWT) · admin.js (role check)
│   ├── config/         seed.js (songs + admin user)
│   ├── server.js
│   └── .env
│
└── frontend/src/app/
    ├── components/
    │   ├── navbar/     NavbarComponent · SidebarComponent
    │   ├── player/     PlayerComponent
    │   ├── home/       HomeComponent · SongCardComponent
    │   ├── search/     SearchComponent
    │   ├── playlist/   PlaylistComponent
    │   ├── auth/       LoginComponent · RegisterComponent
    │   └── admin/      AdminComponent (dashboard · users · songs · artists)
    ├── services/       auth · song · player · playlist · admin
    ├── guards/         auth.guard · admin.guard
    └── models/         models.ts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
- Angular CLI: `npm install -g @angular/cli`

### 1 — Start MongoDB
```bash
# Mac
brew services start mongodb-community
# Linux
sudo systemctl start mongod
# Windows: Start MongoDB service from Services panel
```

### 2 — Backend
```bash
cd musicwave/backend
npm install
npm run dev
# ✅ http://localhost:5000
# ✅ Admin seeded: admin@musicwave.com / admin123
```

### 3 — Frontend
```bash
cd musicwave/frontend
npm install
ng serve
# ✅ http://localhost:4200
```

---

## 👑 Admin Panel Features

Visit `/admin` after logging in as admin.

| Tab | Features |
|-----|----------|
| Dashboard | Live stats: users, songs, plays, likes, playlists, pending artists |
| Users | List all users, change roles (user ↔ admin), activate/deactivate, delete |
| Songs | Add songs, edit metadata, toggle featured, reset likes, delete |
| Artists | View pending submissions, approve/reject with notes, delete |

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create user account |
| POST | /api/auth/login | Login, returns JWT |
| GET  | /api/auth/me | Get current user |

### Songs (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/songs | List/search/filter songs |
| GET  | /api/songs/trending | Top 10 by plays |
| GET  | /api/songs/genres | All genres |
| POST | /api/songs/:id/play | Increment plays |
| POST | /api/songs/:id/like | Like/unlike (auth) |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/admin/stats | Dashboard stats |
| GET  | /api/admin/users | All users |
| PUT  | /api/admin/users/:id/role | Change role |
| PUT  | /api/admin/users/:id/toggle-active | Ban/unban |
| DEL  | /api/admin/users/:id | Delete user |
| POST | /api/admin/songs | Add song |
| PUT  | /api/admin/songs/:id | Edit song |
| PUT  | /api/admin/songs/:id/featured | Toggle featured |
| PUT  | /api/admin/songs/:id/reset-likes | Reset likes |
| DEL  | /api/admin/songs/:id | Delete song |
| GET  | /api/admin/artists | Artist submissions |
| PUT  | /api/admin/artists/:id/approve | Approve artist |
| PUT  | /api/admin/artists/:id/reject | Reject artist |

---

Made with ❤️ using the MEAN Stack


A beginner-level full-stack music streaming website built with:
- **M**ongoDB (database)
- **E**xpress.js (backend API)
- **A**ngular (frontend)
- **N**ode.js (runtime)

---

## 📁 Project Structure

```
musicwave/
├── backend/               ← Node.js + Express + MongoDB API
│   ├── models/            ← Mongoose schemas (User, Song, Playlist)
│   ├── routes/            ← REST API routes
│   ├── middleware/        ← JWT auth middleware
│   ├── config/            ← DB seed data
│   ├── server.js          ← Entry point
│   └── .env               ← Environment variables
│
└── frontend/              ← Angular 17 app
    └── src/app/
        ├── components/    ← UI components
        │   ├── navbar/    ← Top navbar + Sidebar
        │   ├── player/    ← Music player bar
        │   ├── home/      ← Home page + Song cards
        │   ├── search/    ← Search & filter page
        │   ├── playlist/  ← Playlist management
        │   └── auth/      ← Login & Register
        ├── services/      ← Angular services (auth, songs, player, playlists)
        ├── models/        ← TypeScript interfaces
        └── guards/        ← Route protection
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
- Angular CLI: `npm install -g @angular/cli`

---

### Step 1 — Start MongoDB

**Windows:** Search "Services" → Start "MongoDB"
**Mac/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongod
```

---

### Step 2 — Run the Backend

```bash
cd musicwave/backend
npm install
npm run dev
```

✅ Backend runs on: http://localhost:5000
✅ Sample songs auto-seeded on first run

Test it: http://localhost:5000/api/health

---

### Step 3 — Run the Frontend

```bash
cd musicwave/frontend
npm install
ng serve
```

✅ App runs on: http://localhost:4200

---

## 🎯 Features

| Feature | Description |
|---|---|
| 🏠 Home | Hero banner, trending tracks, featured songs |
| 🔍 Search | Search by title/artist/album, filter by genre |
| 🎧 Player | Play/pause/next/prev, seek bar, volume control |
| ❤️ Like Songs | Like/unlike songs (requires login) |
| 📂 Playlists | Create, manage, delete playlists (requires login) |
| 👤 Auth | Register, login, JWT-based sessions |

---

## 🔌 API Endpoints

### Auth
| Method | URL | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Songs
| Method | URL | Description |
|---|---|---|
| GET | /api/songs | List songs (supports ?search=, ?genre=, ?featured=true) |
| GET | /api/songs/trending | Top 10 most-played |
| GET | /api/songs/:id | Single song |
| POST | /api/songs/:id/play | Increment play count |
| POST | /api/songs/:id/like | Like/unlike (auth required) |

### Playlists
| Method | URL | Description |
|---|---|---|
| GET | /api/playlists | My playlists (auth required) |
| POST | /api/playlists | Create playlist (auth required) |
| POST | /api/playlists/:id/songs | Add song to playlist |
| DELETE | /api/playlists/:id/songs/:sid | Remove song |
| DELETE | /api/playlists/:id | Delete playlist |

---

## 🎨 Tech Stack Details

**Backend:**
- express — HTTP server
- mongoose — MongoDB ODM
- bcryptjs — Password hashing
- jsonwebtoken — JWT auth
- express-validator — Input validation
- cors — Cross-origin requests
- dotenv — Environment variables

**Frontend:**
- Angular 17 — Component framework
- Angular Router — Client-side routing
- HttpClient — API calls
- Reactive Forms — Form handling
- RxJS — Observables & state
- Google Fonts (Syne + DM Sans)
- Font Awesome icons

---

## 💡 How It Works

1. User opens app → Home page loads featured & trending songs
2. Click play → `PlayerService` loads audio, streams from URL
3. Search → debounced API call with filters
4. Like a song → requires JWT → stored in user's `likedSongs`
5. Create playlist → POST to API → shown immediately in UI

---

## 🛠 Customization

- **Add real songs:** Update `backend/config/seed.js` with real audio URLs
- **Change theme:** Edit CSS variables in `frontend/src/styles.css`
- **Add genres:** Update the `genre` enum in `backend/models/Song.js`
- **Deploy:** Frontend → Netlify/Vercel | Backend → Railway/Render | DB → MongoDB Atlas

---

## 📝 Notes

- Audio URLs in seed data use SoundHelix (free demo audio)
- Replace with real CDN-hosted MP3 URLs for production
- MongoDB must be running locally before starting the backend
- Default port: Backend=5000, Frontend=4200

---

Made with ❤️ using the MEAN Stack
