import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo/Home Link -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-block">
            <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">MyFeed<span class="text-blue-600">.lk</span></h1>
          </a>
        </div>

        <div class="bg-white dark:bg-[#111] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8 border border-slate-200/50 dark:border-white/5">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            {{ mode() === 'login' ? 'Welcome back' : mode() === 'signup' ? 'Create an account' : 'Reset password' }}
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-center mb-8">
            {{ mode() === 'login' ? 'Enter your details to sign in' : mode() === 'signup' ? 'Join our community today' : 'Enter your email to receive a reset link' }}
          </p>

          <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="auth-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style="font-size: 20px; width: 20px; height: 20px;">mail</mat-icon>
                <input 
                  id="auth-email"
                  type="email" 
                  formControlName="email"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                >
              </div>
            </div>

            @if (mode() !== 'reset') {
              <div>
                <label for="auth-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style="font-size: 20px; width: 20px; height: 20px;">lock</mat-icon>
                  <input 
                    id="auth-password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  >
                  <button 
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <mat-icon style="font-size: 20px; width: 20px; height: 20px;">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
              </div>
            }

            @if (errorMessage()) {
              <div class="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">error_outline</mat-icon>
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">check_circle_outline</mat-icon>
                {{ successMessage() }}
              </div>
            }

            <button 
              type="submit"
              [disabled]="loading()"
              class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
            >
              @if (loading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              }
              {{ mode() === 'login' ? 'Sign in' : mode() === 'signup' ? 'Create account' : 'Send reset link' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
            @if (mode() === 'login') {
              <div class="flex flex-col gap-3 text-center text-sm">
                <button (click)="setMode('signup')" class="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
                  Don't have an account? <span class="font-bold text-blue-600">Sign up</span>
                </button>
                <button (click)="setMode('reset')" class="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
                  Forgot your password?
                </button>
              </div>
            } @else {
              <div class="text-center text-sm">
                <button (click)="setMode('login')" class="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
                  Already have an account? <span class="font-bold text-blue-600">Sign in</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'signup' | 'reset'>('login');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showPassword = signal(false);

  readonly authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  setMode(newMode: 'login' | 'signup' | 'reset') {
    this.mode.set(newMode);
    this.errorMessage.set('');
    this.successMessage.set('');
    if (newMode === 'reset') {
      this.authForm.get('password')?.disable();
    } else {
      this.authForm.get('password')?.enable();
    }
  }

  async onSubmit() {
    if (this.authForm.invalid && this.mode() !== 'reset') return;
    if (this.authForm.get('email')?.invalid && this.mode() === 'reset') return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email, password } = this.authForm.getRawValue();

    try {
      if (this.mode() === 'login') {
        await this.authService.login(email!, password!);
        const isAdmin = this.authService.isAdmin();
        this.router.navigate([isAdmin ? '/admin' : '/']);
      } else if (this.mode() === 'signup') {
        await this.authService.signUp(email!, password!);
        this.successMessage.set('Account created successfully!');
        setTimeout(() => this.setMode('login'), 2000);
      } else {
        await this.authService.resetPassword(email!);
        this.successMessage.set('Password reset link sent to your email.');
      }
    } catch (err: unknown) {
      const error = err as { code: string };
      this.errorMessage.set(this.getFirebaseErrorMessage(error.code));
    } finally {
      this.loading.set(false);
    }
  }

  private getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'No user found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/email-already-in-use': return 'Email already in use.';
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/weak-password': return 'Password is too weak.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  }
}
