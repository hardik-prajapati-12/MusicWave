import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaylistService } from '../../services/playlist.service';
import { SongService } from '../../services/song.service';
import { PlayerService } from '../../services/player.service';
import { Playlist, Song } from '../../models/models';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, OnDestroy {
  playlists: Playlist[] = [];
  selectedPlaylist: Playlist | null = null;
  loading = true;

  showCreateForm = false;
  newPlaylistName = '';
  newPlaylistDesc = '';

  showAddSongModal = false;
  searchQuery = '';
  searchResults: Song[] = [];
  searchLoading = false;

  toast = '';

  private durationMap: Record<string, number> = {};
  private subs = new Subscription();

  constructor(
    private playlistService: PlaylistService,
    public songService: SongService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
    this.subs.add(
      this.playerService.durationMap$.subscribe(map => {
        this.durationMap = map;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getRealDuration(song: Song): number {
    return this.durationMap[song._id] ?? song.duration ?? 0;
  }

  loadPlaylists(): void {
    this.playlistService.getMyPlaylists().subscribe({
      next: lists => { this.playlists = lists; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createPlaylist(): void {
    if (!this.newPlaylistName.trim()) return;
    this.playlistService.createPlaylist({
      name: this.newPlaylistName,
      description: this.newPlaylistDesc
    }).subscribe({
      next: p => {
        this.playlists.unshift(p);
        this.newPlaylistName = '';
        this.newPlaylistDesc = '';
        this.showCreateForm = false;
        this.showToast('Playlist created! 🎉');
      }
    });
  }

  deletePlaylist(id: string, e: Event): void {
    e.stopPropagation();
    if (!confirm('Delete this playlist?')) return;
    this.playlistService.deletePlaylist(id).subscribe(() => {
      this.playlists = this.playlists.filter(p => p._id !== id);
      if (this.selectedPlaylist?._id === id) this.selectedPlaylist = null;
      this.showToast('Playlist deleted');
    });
  }

  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist = playlist;
  }

  openAddSongModal(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showAddSongModal = true;
    this.doSearch();
  }

  doSearch(): void {
    this.searchLoading = true;
    this.songService.getSongs({ search: this.searchQuery || undefined, limit: 30 }).subscribe({
      next: res => { this.searchResults = res.songs; this.searchLoading = false; },
      error: () => { this.searchLoading = false; }
    });
  }

  isSongInPlaylist(songId: string): boolean {
    return !!this.selectedPlaylist?.songs?.some(s => s._id === songId);
  }

  addSongToPlaylist(song: Song): void {
    if (!this.selectedPlaylist) return;
    if (this.isSongInPlaylist(song._id)) {
      this.showToast('Song already in playlist');
      return;
    }
    this.playlistService.addSongToPlaylist(this.selectedPlaylist._id, song._id).subscribe({
      next: updated => {
        this.selectedPlaylist!.songs = updated.songs || [...(this.selectedPlaylist!.songs || []), song];
        this.showToast('"' + song.title + '" added!');
      },
      error: () => this.showToast('Failed to add song')
    });
  }

  removeSong(playlistId: string, songId: string): void {
    this.playlistService.removeSongFromPlaylist(playlistId, songId).subscribe(() => {
      if (this.selectedPlaylist) {
        this.selectedPlaylist.songs = this.selectedPlaylist.songs.filter(s => s._id !== songId);
      }
      this.showToast('Song removed');
    });
  }

  playSong(song: Song): void {
    this.playerService.playSong(song, this.selectedPlaylist?.songs || [], 'playlist');
  }

  playAll(): void {
    if (this.selectedPlaylist && this.selectedPlaylist.songs && this.selectedPlaylist.songs.length) {
      this.playerService.playSong(this.selectedPlaylist.songs[0], this.selectedPlaylist.songs, 'playlist');
    }
  }

  totalDuration(songs: Song[]): string {
    const total = songs.reduce((acc, s) => acc + this.getRealDuration(s), 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return h ? h + 'h ' + m + 'm' : m + 'm';
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}