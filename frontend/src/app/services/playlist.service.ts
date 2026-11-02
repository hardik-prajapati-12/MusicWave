import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private apiUrl = 'http://localhost:5000/api/playlists';

  constructor(private http: HttpClient) {}

  getMyPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(this.apiUrl);
  }

  getPublicPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/public`);
  }

  createPlaylist(data: { name: string; description?: string; isPublic?: boolean }): Observable<Playlist> {
    return this.http.post<Playlist>(this.apiUrl, data);
  }

  addSongToPlaylist(playlistId: string, songId: string): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/${playlistId}/songs`, { songId });
  }

  removeSongFromPlaylist(playlistId: string, songId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${playlistId}/songs/${songId}`);
  }

  deletePlaylist(playlistId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${playlistId}`);
  }
}
