import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  searchQuery = '';

  constructor(
    public auth: AuthService,
    private router: Router,
    private playerService: PlayerService
  ) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  logout(): void {
    this.playerService.stop();   // stop music immediately
    this.auth.logout();
    this.router.navigate(['/']);
  }
}