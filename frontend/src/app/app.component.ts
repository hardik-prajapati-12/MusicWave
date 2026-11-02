import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>
      <div class="app-body">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-player></app-player>
    </div>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
