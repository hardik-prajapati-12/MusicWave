import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { SongService } from '../../services/song.service';
import { UploadService } from '../../services/upload.service';
import { AdminStats, User, Song } from '../../models/models';

type Tab = 'dashboard' | 'users' | 'songs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: Tab = 'dashboard';
  stats: AdminStats | null = null;
  users: User[] = [];
  songs: Song[] = [];

  loading = false;
  toast = '';
  toastType: 'success' | 'error' = 'success';

  userSearch = '';
  songSearch = '';
  userRoleFilter = '';

  showSongModal = false;
  editingSong: Song | null = null;
  songForm: Partial<Song> = {};

  // File state
  audioFile: File | null = null;
  imageFile: File | null = null;
  audioFileName = '';
  imageFileName = '';
  audioPreviewUrl = '';
  imagePreviewUrl = '';
  uploading = false;

  genres = ['Pop','Rock','Hip-Hop','Jazz','Classical','Electronic','R&B','Country','Indie','Metal'];

  constructor(
    private adminService: AdminService,
    public songService: SongService,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void { this.loadDashboard(); }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'dashboard') this.loadDashboard();
    if (tab === 'users')     this.loadUsers();
    if (tab === 'songs')     this.loadSongs();
  }

  // ── Dashboard ──────────────────────────────────────────────
  loadDashboard(): void {
    this.loading = true;
    this.adminService.getStats().subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // ── Users ──────────────────────────────────────────────────
  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers(this.userSearch, this.userRoleFilter).subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getUserId(user: any): string {
    return user._id || user.id || '';
  }

  changeRole(user: any, role: string): void {
    const id = this.getUserId(user);
    if (!id) { this.showToast('Cannot identify user', 'error'); return; }
    this.adminService.changeUserRole(id, role).subscribe({
      next: (updated: any) => {
        user.role = updated.role;
        this.showToast(user.username + ' is now ' + role);
      },
      error: (err: any) => this.showToast(err.error?.message || 'Failed to update role', 'error')
    });
  }

  toggleActive(user: any): void {
    const id = this.getUserId(user);
    if (!id) { this.showToast('Cannot identify user', 'error'); return; }
    this.adminService.toggleUserActive(id).subscribe({
      next: (res: any) => { user.isActive = res.isActive; this.showToast(res.message); },
      error: (err: any) => this.showToast(err.error?.message || 'Failed to update', 'error')
    });
  }

  deleteUser(user: any): void {
    if (!confirm('Delete user "' + user.username + '"? This cannot be undone.')) return;
    const id = this.getUserId(user);
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u: any) => this.getUserId(u) !== id);
        this.showToast('User deleted');
      },
      error: (err: any) => this.showToast(err.error?.message || 'Failed', 'error')
    });
  }

  // ── Songs ──────────────────────────────────────────────────
  loadSongs(): void {
    this.loading = true;
    this.adminService.getAdminSongs(this.songSearch).subscribe({
      next: s => { this.songs = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAddSong(): void {
    this.editingSong = null;
    this.songForm = { genre: 'Pop', releaseYear: new Date().getFullYear(), featured: false, duration: 0 };
    this.clearFileState();
    this.showSongModal = true;
  }

  openEditSong(song: Song): void {
    this.editingSong = song;
    this.songForm = { ...song };
    this.clearFileState();
    // Show existing file indicators
    this.audioFileName  = song.audioUrl   ? 'Current audio file (keep or replace)' : '';
    this.imageFileName  = song.coverImage ? 'Current cover image (keep or replace)' : '';
    this.audioPreviewUrl = song.audioUrl   || '';
    this.imagePreviewUrl = song.coverImage || '';
    this.showSongModal = true;
  }

  private clearFileState(): void {
    this.audioFile = null;
    this.imageFile = null;
    this.audioFileName = '';
    this.imageFileName = '';
    this.audioPreviewUrl = '';
    this.imagePreviewUrl = '';
  }

  // ── File selection handlers ────────────────────────────────
  onAudioFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (!file.type.startsWith('audio/')) {
      this.showToast('Please select a valid audio file (MP3, WAV, OGG)', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.showToast('Audio file must be under 50MB', 'error');
      return;
    }

    this.audioFile = file;
    this.audioFileName = file.name;

    // Local preview using object URL (only for preview, not stored)
    this.audioPreviewUrl = URL.createObjectURL(file);

    // Auto-detect real duration from the selected file
    const tempAudio = new Audio();
    tempAudio.src = this.audioPreviewUrl;
    tempAudio.addEventListener('loadedmetadata', () => {
      const dur = Math.round(tempAudio.duration);
      this.songForm.duration = isFinite(dur) && dur > 0 ? dur : 0;
      tempAudio.src = '';
    });
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image must be under 5MB', 'error');
      return;
    }

    this.imageFile = file;
    this.imageFileName = file.name;

    // Show local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── Save song ──────────────────────────────────────────────
  saveSong(): void {
    if (!this.songForm.title?.trim() || !this.songForm.artist?.trim()) {
      this.showToast('Title and Artist are required', 'error');
      return;
    }
    if (!this.editingSong && !this.audioFile) {
      this.showToast('Please select an audio file', 'error');
      return;
    }

    const hasNewFiles = this.audioFile || this.imageFile;

    if (hasNewFiles) {
      // Step 1: Upload files to server, get back file URLs
      this.uploading = true;
      this.uploadService.uploadSongFiles(this.audioFile, this.imageFile).subscribe({
        next: (result) => {
          this.uploading = false;
          // Update form with server file paths
          if (result.audioUrl)   this.songForm.audioUrl   = result.audioUrl;
          if (result.coverImage) this.songForm.coverImage = result.coverImage;
          // Step 2: Save song metadata to DB
          this.persistSong();
        },
        error: (err) => {
          this.uploading = false;
          this.showToast(err.error?.message || 'File upload failed', 'error');
        }
      });
    } else {
      // No new files — just update metadata
      this.persistSong();
    }
  }

  private persistSong(): void {
    const payload = { ...this.songForm };

    if (this.editingSong) {
      this.adminService.updateSong(this.editingSong._id, payload).subscribe({
        next: updated => {
          const idx = this.songs.findIndex(s => s._id === updated._id);
          if (idx > -1) this.songs[idx] = updated;
          this.showSongModal = false;
          this.showToast('Song updated!');
        },
        error: () => this.showToast('Failed to update song', 'error')
      });
    } else {
      this.adminService.createSong(payload).subscribe({
        next: song => {
          this.songs.unshift(song);
          this.showSongModal = false;
          this.showToast('Song added!');
        },
        error: () => this.showToast('Failed to add song', 'error')
      });
    }
  }

  toggleFeatured(song: Song): void {
    this.adminService.toggleFeatured(song._id).subscribe({
      next: res => { song.featured = res.featured; this.showToast(res.message); },
      error: () => this.showToast('Failed', 'error')
    });
  }

  resetLikes(song: Song): void {
    if (!confirm('Reset likes for "' + song.title + '" to 0?')) return;
    this.adminService.resetLikes(song._id).subscribe({
      next: () => { song.likes = 0; this.showToast('Likes reset'); },
      error: () => this.showToast('Failed', 'error')
    });
  }

  deleteSong(song: Song): void {
    if (!confirm('Delete "' + song.title + '"? Files will also be removed.')) return;
    this.adminService.deleteSong(song._id).subscribe({
      next: () => {
        this.songs = this.songs.filter(s => s._id !== song._id);
        this.showToast('Song and files deleted');
      },
      error: () => this.showToast('Failed', 'error')
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  formatNum(n: number): string {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 3500);
  }

  trackById(_: number, item: any): string { return item._id || item.id; }
}