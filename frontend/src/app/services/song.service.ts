import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SongService {
  private apiUrl = 'http://localhost:5000/api/songs';

  constructor(private http: HttpClient) {}

  getSongs(filters?: { genre?: string; search?: string; featured?: boolean; limit?: number; sort?: string }): Observable<{ songs: Song[]; total: number }> {
    let params = new HttpParams();
    if (filters?.genre)   params = params.set('genre', filters.genre);
    if (filters?.search)  params = params.set('search', filters.search);
    if (filters?.featured) params = params.set('featured', 'true');
    if (filters?.limit)   params = params.set('limit', filters.limit.toString());
    if (filters?.sort)    params = params.set('sort', filters.sort);
    return this.http.get<{ songs: Song[]; total: number }>(this.apiUrl, { params });
  }

  getTrending(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/trending`);
  }

  getFeatured(): Observable<{ songs: Song[] }> {
    return this.getSongs({ featured: true });
  }

  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genres`);
  }

  getSong(id: string): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/${id}`);
  }

  incrementPlay(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/play`, {});
  }

  updateDuration(id: string, duration: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/duration`, { duration });
  }

  likeSong(id: string): Observable<{ liked: boolean; message: string }> {
    return this.http.post<{ liked: boolean; message: string }>(`${this.apiUrl}/${id}/like`, {});
  }

  formatDuration(seconds: number): string {
    if (!seconds || !isFinite(seconds) || seconds <= 0) return '0:00';
    const totalSecs = Math.round(seconds);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}