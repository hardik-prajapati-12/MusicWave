import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
          <i class="fas fa-home"></i><span>Home</span>
        </a>
        <a routerLink="/search" routerLinkActive="active" class="nav-item">
          <i class="fas fa-search"></i><span>Discover</span>
        </a>
        <a routerLink="/playlists" routerLinkActive="active" class="nav-item">
          <i class="fas fa-list-music"></i><span>My Playlists</span>
        </a>
        <a *ngIf="auth.currentUser?.role === 'admin'"
           routerLink="/admin" routerLinkActive="active" class="nav-item admin-nav-item">
          <i class="fas fa-crown"></i><span>Admin Panel</span>
        </a>
      </nav>

      <div class="sidebar-section">
        <p class="sidebar-label">Genres</p>
        <a *ngFor="let genre of genres" routerLink="/search" [queryParams]="{genre: genre}" class="genre-link">
          <span class="genre-dot" [style.background]="genreColor(genre)"></span>
          {{ genre }}
        </a>
      </div>

      <div class="sidebar-footer" *ngIf="!auth.isLoggedIn()">
        <p class="footer-text">Sign in to create playlists and like songs</p>
        <a routerLink="/register" class="btn btn-primary" style="width:100%;justify-content:center;">
          Create Account
        </a>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  genres = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Metal'];

  genreColors: Record<string, string> = {
    'Pop': '#ec4899', 'Rock': '#ef4444', 'Hip-Hop': '#f59e0b',
    'Jazz': '#3b82f6', 'Classical': '#8b5cf6', 'Electronic': '#06b6d4',
    'R&B': '#10b981', 'Country': '#f97316', 'Indie': '#a855f7', 'Metal': '#6b7280'
  };

  constructor(public auth: AuthService) {}

  genreColor(genre: string): string {
    return this.genreColors[genre] || '#7c3aed';
  }
}
