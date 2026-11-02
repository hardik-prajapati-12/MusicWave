import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page fade-in">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo"><i class="fas fa-wave-square"></i></div>
          <h2>Welcome Back</h2>
          <p>Sign in to your MusicWave account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form" autocomplete="off">
          <div class="form-group">
            <label>Email</label>
            <div class="input-wrap">
              <i class="fas fa-envelope"></i>
              <input type="email" formControlName="email" placeholder="your@email.com"
                     class="form-input" autocomplete="new-email" />
            </div>
            <span class="error" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              Valid email required
            </span>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrap">
              <i class="fas fa-lock"></i>
              <input [type]="showPass ? 'text' : 'password'" formControlName="password"
                     placeholder="••••••••" class="form-input" autocomplete="new-password" />
              <button type="button" class="toggle-pass" (click)="showPass = !showPass">
                <i class="fas" [ngClass]="showPass ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading || loginForm.invalid">
            <span *ngIf="!loading"><i class="fas fa-sign-in-alt"></i> Sign In</span>
            <span *ngIf="loading"><i class="fas fa-spinner fa-spin"></i> Signing in...</span>
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Create one free</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMsg = '';
  showPass = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Always build a fresh empty form — prevents browser autofill persisting
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // If already logged in, redirect home
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.errorMsg = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
