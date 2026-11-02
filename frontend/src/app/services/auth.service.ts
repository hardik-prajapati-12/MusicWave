import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('mw_token');
    const user = localStorage.getItem('mw_user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('mw_token');
    localStorage.removeItem('mw_user');
    this.currentUserSubject.next(null);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('mw_token', res.token);
    localStorage.setItem('mw_user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  getToken(): string | null {
    return localStorage.getItem('mw_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
