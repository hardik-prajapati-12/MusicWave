import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page fade-in">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo"><i class="fas fa-wave-square"></i></div>
          <h2>Join MusicWave</h2>
          <p>Create your free account and start listening</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form" autocomplete="off">
          <div class="form-group">
            <label>Username</label>
            <div class="input-wrap">
              <i class="fas fa-user"></i>
              <input type="text" formControlName="username" placeholder="Choose a username"
                     class="form-input" autocomplete="off" />
            </div>
            <span class="error" *ngIf="registerForm.get('username')?.touched && registerForm.get('username')?.invalid">
              Username must be at least 3 characters
            </span>
          </div>

          <div class="form-group">
            <label>Email</label>
            <div class="input-wrap">
              <i class="fas fa-envelope"></i>
              <input type="email" formControlName="email" placeholder="your@email.com"
                     class="form-input" autocomplete="off" />
            </div>
            <span class="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
              Valid email required
            </span>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrap">
              <i class="fas fa-lock"></i>
              <input [type]="showPass ? 'text' : 'password'" formControlName="password"
                     placeholder="Min. 6 characters" class="form-input" autocomplete="new-password" />
              <button type="button" class="toggle-pass" (click)="showPass = !showPass">
                <i class="fas" [ngClass]="showPass ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <span class="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
              Password must be at least 6 characters
            </span>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading || registerForm.invalid">
            <span *ngIf="!loading"><i class="fas fa-user-plus"></i> Create Account</span>
            <span *ngIf="loading"><i class="fas fa-spinner fa-spin"></i> Creating...</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMsg = '';
  showPass = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Always fresh empty form
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // Already logged in → redirect
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.auth.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.errorMsg = err.error?.message || err.error?.errors?.[0]?.msg || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}
