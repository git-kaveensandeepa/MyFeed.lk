import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { BookmarkManager } from './bookmark';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <!-- AUTHENTICATION MODAL (LOGIN / SIGN UP / FORGOT PASSWORD) -->
    @if (authService.showAuthModal()) {
      <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <!-- Backdrop -->
        <div 
          (click)="authService.closeAuthModal()" 
          (keyup.enter)="authService.closeAuthModal()"
          (keyup.space)="authService.closeAuthModal()"
          tabindex="0"
          role="button"
          class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity">
        </div>

        <!-- Modal Card -->
        <div class="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-10 flex flex-col max-h-[92vh]">
          
          <!-- Modal Header -->
          <div class="px-6 pt-6 pb-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                @if (authService.authModalTab() === 'login') {
                  <mat-icon>login</mat-icon>
                } @else if (authService.authModalTab() === 'signup') {
                  <mat-icon>person_add</mat-icon>
                } @else {
                  <mat-icon>lock_reset</mat-icon>
                }
              </div>
              <div>
                <h3 class="text-xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                  @if (authService.authModalTab() === 'login') {
                    Log In
                  } @else if (authService.authModalTab() === 'signup') {
                    Create Account
                  } @else {
                    Reset Password
                  }
                </h3>
                <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60 font-medium">
                  @if (authService.authModalTab() === 'login') {
                    Welcome back to MyFeed.lk
                  } @else if (authService.authModalTab() === 'signup') {
                    Join Sri Lanka's curated news journal
                  } @else {
                    Enter your email to receive a reset link
                  }
                </p>
              </div>
            </div>

            <!-- Close Button -->
            <button 
              (click)="authService.closeAuthModal()"
              class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white flex items-center justify-center transition-all cursor-pointer">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
            </button>
          </div>

          <!-- Tab Selector (Only for Login & SignUp) -->
          @if (authService.authModalTab() !== 'forgot') {
            <div class="px-6 pt-4 shrink-0">
              <div class="grid grid-cols-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                <button
                  type="button"
                  (click)="authService.setAuthTab('login')"
                  class="py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  [class.bg-white]="authService.authModalTab() === 'login'"
                  [class.dark:bg-[#2c2c2e]]="authService.authModalTab() === 'login'"
                  [class.text-blue-600]="authService.authModalTab() === 'login'"
                  [class.dark:text-blue-400]="authService.authModalTab() === 'login'"
                  [class.shadow-sm]="authService.authModalTab() === 'login'"
                  [class.text-[#1d1d1f]/60]="authService.authModalTab() !== 'login'"
                  [class.dark:text-white/60]="authService.authModalTab() !== 'login'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">login</mat-icon>
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  (click)="authService.setAuthTab('signup')"
                  class="py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  [class.bg-white]="authService.authModalTab() === 'signup'"
                  [class.dark:bg-[#2c2c2e]]="authService.authModalTab() === 'signup'"
                  [class.text-blue-600]="authService.authModalTab() === 'signup'"
                  [class.dark:text-blue-400]="authService.authModalTab() === 'signup'"
                  [class.shadow-sm]="authService.authModalTab() === 'signup'"
                  [class.text-[#1d1d1f]/60]="authService.authModalTab() !== 'signup'"
                  [class.dark:text-white/60]="authService.authModalTab() !== 'signup'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">person_add</mat-icon>
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          }

          <!-- Modal Body with Scroll -->
          <div class="p-6 overflow-y-auto space-y-4 flex-1">
            
            <!-- Alert / Error Banner -->
            @if (authService.authError()) {
              <div class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <mat-icon class="shrink-0 text-rose-600 dark:text-rose-400" style="font-size: 18px; width: 18px; height: 18px;">error_outline</mat-icon>
                <span class="leading-relaxed font-medium">{{ authService.authError() }}</span>
              </div>
            }

            <!-- Success Banner -->
            @if (authService.authSuccess()) {
              <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <mat-icon class="shrink-0 text-emerald-600 dark:text-emerald-400" style="font-size: 18px; width: 18px; height: 18px;">check_circle</mat-icon>
                <span class="leading-relaxed font-medium">{{ authService.authSuccess() }}</span>
              </div>
            }

            <!-- 1. SIGN IN FORM -->
            @if (authService.authModalTab() === 'login') {
              <form (ngSubmit)="handleLogin()" class="space-y-4">
                <div>
                  <label for="loginEmailInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-1.5">
                    Email Address <span class="text-blue-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mail_outline</mat-icon>
                    </div>
                    <input 
                      type="email" 
                      id="loginEmailInput"
                      [(ngModel)]="loginEmail" 
                      name="loginEmail" 
                      required
                      placeholder="name@example.com"
                      class="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="loginPasswordInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider">
                      Password <span class="text-blue-500">*</span>
                    </label>
                    <button 
                      type="button" 
                      (click)="authService.setAuthTab('forgot')"
                      class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">lock_outline</mat-icon>
                    </div>
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      id="loginPasswordInput"
                      [(ngModel)]="loginPassword" 
                      name="loginPassword" 
                      required
                      placeholder="••••••••"
                      class="w-full pl-10 pr-11 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                    
                    <button 
                      type="button"
                      (click)="toggleShowPassword()"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">
                        {{ showPassword() ? 'visibility_off' : 'visibility' }}
                      </mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  [disabled]="authService.isProcessing() || !loginEmail || !loginPassword"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
                  @if (authService.isProcessing()) {
                    <mat-icon class="animate-spin" style="font-size: 18px; width: 18px; height: 18px;">sync</mat-icon>
                    <span>Signing in...</span>
                  } @else {
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">login</mat-icon>
                    <span>Log In to Account</span>
                  }
                </button>
              </form>
            }

            <!-- 2. SIGN UP FORM (EMAIL, PASSWORD, NAME, BIRTHDAY) -->
            @if (authService.authModalTab() === 'signup') {
              <form (ngSubmit)="handleSignUp()" class="space-y-3.5">
                
                <!-- Full Name -->
                <div>
                  <label for="signupNameInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-1">
                    Full Name (නම) <span class="text-blue-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">badge</mat-icon>
                    </div>
                    <input 
                      type="text" 
                      id="signupNameInput"
                      [(ngModel)]="signupName" 
                      name="signupName" 
                      required
                      placeholder="e.g. Kasun Perera"
                      class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label for="signupEmailInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-1">
                    Email Address (ඊමේල්) <span class="text-blue-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mail_outline</mat-icon>
                    </div>
                    <input 
                      type="email" 
                      id="signupEmailInput"
                      [(ngModel)]="signupEmail" 
                      name="signupEmail" 
                      required
                      placeholder="name@example.com"
                      class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                  </div>
                </div>

                <!-- Password -->
                <div>
                  <label for="signupPasswordInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-1">
                    Password (මුරපදය) <span class="text-blue-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">lock_outline</mat-icon>
                    </div>
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      id="signupPasswordInput"
                      [(ngModel)]="signupPassword" 
                      name="signupPassword" 
                      required
                      minlength="6"
                      placeholder="At least 6 characters"
                      class="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                    
                    <button 
                      type="button"
                      (click)="toggleShowPassword()"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">
                        {{ showPassword() ? 'visibility_off' : 'visibility' }}
                      </mat-icon>
                    </button>
                  </div>
                  @if (signupPassword && signupPassword.length < 6) {
                    <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">info</mat-icon>
                      Minimum 6 characters required
                    </p>
                  }
                </div>

                <!-- Birthday Field -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label for="signupBirthdayInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider">
                      Birthday (උපන් දිනය) <span class="text-blue-500">*</span>
                    </label>
                    <span class="text-[11px] text-gray-400 font-mono">Date of Birth</span>
                  </div>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">cake</mat-icon>
                    </div>
                    <input 
                      type="date" 
                      id="signupBirthdayInput"
                      [(ngModel)]="signupBirthday" 
                      name="signupBirthday" 
                      required
                      max="2020-01-01"
                      min="1920-01-01"
                      class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                  </div>
                </div>

                <!-- Terms checkbox -->
                <div class="pt-1">
                  <label class="flex items-start gap-2.5 text-xs text-[#1d1d1f]/70 dark:text-white/70 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="agreeTerms" 
                      name="agreeTerms"
                      class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span>I agree to MyFeed.lk <a routerLink="/terms" (click)="authService.closeAuthModal()" class="text-blue-600 dark:text-blue-400 underline">Terms</a> & <a routerLink="/privacy" (click)="authService.closeAuthModal()" class="text-blue-600 dark:text-blue-400 underline">Privacy Policy</a></span>
                  </label>
                </div>

                <!-- Submit Sign Up -->
                <button 
                  type="submit" 
                  [disabled]="authService.isProcessing() || !signupName || !signupEmail || !signupPassword || !signupBirthday || !agreeTerms || signupPassword.length < 6"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
                  @if (authService.isProcessing()) {
                    <mat-icon class="animate-spin" style="font-size: 18px; width: 18px; height: 18px;">sync</mat-icon>
                    <span>Creating account...</span>
                  } @else {
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">person_add</mat-icon>
                    <span>Create Free Account</span>
                  }
                </button>
              </form>
            }

            <!-- 3. FORGOT PASSWORD FORM -->
            @if (authService.authModalTab() === 'forgot') {
              <form (ngSubmit)="handleForgotPassword()" class="space-y-4">
                <div>
                  <label for="forgotEmailInput" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-1.5">
                    Registered Email Address <span class="text-blue-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mail_outline</mat-icon>
                    </div>
                    <input 
                      type="email" 
                      id="forgotEmailInput"
                      [(ngModel)]="forgotEmail" 
                      name="forgotEmail" 
                      required
                      placeholder="name@example.com"
                      class="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium transition-all" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  [disabled]="authService.isProcessing() || !forgotEmail"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  @if (authService.isProcessing()) {
                    <mat-icon class="animate-spin" style="font-size: 18px; width: 18px; height: 18px;">sync</mat-icon>
                    <span>Sending email...</span>
                  } @else {
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">send</mat-icon>
                    <span>Send Password Reset Link</span>
                  }
                </button>

                <div class="text-center pt-2">
                  <button 
                    type="button" 
                    (click)="authService.setAuthTab('login')"
                    class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">arrow_back</mat-icon>
                    <span>Back to Log In</span>
                  </button>
                </div>
              </form>
            }


          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 text-center shrink-0">
            @if (authService.authModalTab() === 'login') {
              <p class="text-xs text-[#1d1d1f]/70 dark:text-white/70">
                Don't have an account? 
                <button (click)="authService.setAuthTab('signup')" class="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1">
                  Sign Up Free
                </button>
              </p>
            } @else if (authService.authModalTab() === 'signup') {
              <p class="text-xs text-[#1d1d1f]/70 dark:text-white/70">
                Already registered? 
                <button (click)="authService.setAuthTab('login')" class="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1">
                  Log In
                </button>
              </p>
            }
          </div>

        </div>
      </div>
    }
  `
})
export class AuthModalComponent {
  readonly authService = inject(AuthService);
  readonly bookmarkManager = inject(BookmarkManager);

  // Form states
  loginEmail = '';
  loginPassword = '';
  showPassword = signal(false);

  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupBirthday = '';
  agreeTerms = true;

  forgotEmail = '';

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  async handleLogin() {
    if (!this.loginEmail || !this.loginPassword) return;
    await this.authService.signInWithEmail(this.loginEmail, this.loginPassword);
  }

  async handleSignUp() {
    if (!this.signupName || !this.signupEmail || !this.signupPassword || !this.signupBirthday) return;
    await this.authService.signUpWithEmail(
      this.signupEmail, 
      this.signupPassword, 
      this.signupName, 
      this.signupBirthday
    );
  }

  async handleForgotPassword() {
    if (!this.forgotEmail) return;
    await this.authService.sendPasswordReset(this.forgotEmail);
  }
}
