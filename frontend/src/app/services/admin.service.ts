import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats, User, Song, Artist } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  // Stats
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  // Users
  getUsers(search?: string, role?: string): Observable<User[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    return this.http.get<User[]>(`${this.apiUrl}/users`, { params });
  }

  changeUserRole(userId: string, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  toggleUserActive(userId: string): Observable<{ isActive: boolean; message: string }> {
    return this.http.put<{ isActive: boolean; message: string }>(`${this.apiUrl}/users/${userId}/toggle-active`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // Songs
  getAdminSongs(search?: string): Observable<Song[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Song[]>(`${this.apiUrl}/songs`, { params });
  }

  createSong(data: Partial<Song>): Observable<Song> {
    return this.http.post<Song>(`${this.apiUrl}/songs`, data);
  }

  updateSong(id: string, data: Partial<Song>): Observable<Song> {
    return this.http.put<Song>(`${this.apiUrl}/songs/${id}`, data);
  }

  toggleFeatured(id: string): Observable<{ featured: boolean; message: string }> {
    return this.http.put<{ featured: boolean; message: string }>(`${this.apiUrl}/songs/${id}/featured`, {});
  }

  resetLikes(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/songs/${id}/reset-likes`, {});
  }

  deleteSong(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/songs/${id}`);
  }

  // Artists
  getArtists(status?: string): Observable<Artist[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Artist[]>(`${this.apiUrl}/artists`, { params });
  }

  approveArtist(id: string, note?: string): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/artists/${id}/approve`, { note });
  }

  rejectArtist(id: string, note?: string): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/artists/${id}/reject`, { note });
  }

  deleteArtist(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/artists/${id}`);
  }
}
