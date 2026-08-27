import { ChangeDetectionStrategy, Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BookmarkManager } from './bookmark';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col transition-colors duration-300">
      
      <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-12 mb-12">
        
        <!-- Check if user is logged in -->
        @if (authService.currentUser()) {
          <!-- Profile Card -->
          <div class="relative w-full bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col">
            
            <!-- Header with background accent -->
            <div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-6 sm:px-10 pt-10 pb-16 text-white">
              <div class="flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-widest">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">account_circle</mat-icon>
                <span>User Profile &bull; මගේ ගිණුම</span>
              </div>
            </div>

            <!-- Avatar & Main info overlap -->
            <div class="px-6 sm:px-10 -mt-12 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between shrink-0 gap-4 sm:gap-6">
              <div class="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                <div class="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                  <div class="w-full h-full rounded-2xl bg-white dark:bg-[#2c2c2e] p-1.5 shadow-xl border-2 border-blue-600/30">
                    @if (authService.userProfile()?.photoURL) {
                      <img [src]="authService.userProfile()?.photoURL" alt="Profile" class="w-full h-full rounded-xl object-cover" referrerpolicy="no-referrer" />
                    } @else {
                      <div class="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-3xl sm:text-4xl tracking-wider shadow-inner">
                        {{ authService.userInitials() }}
                      </div>
                    }
                  </div>

                  <!-- Online Status Indicator -->
                  <div class="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 border-4 border-white dark:border-[#1c1c1e] rounded-full z-10 shadow-md" title="Online"></div>

                  <!-- Verification / Admin Badge on Avatar -->
                  @if (authService.userProfile()?.verified || authService.isAdmin()) {
                    <div class="absolute -top-2 -right-2 z-10 bg-white dark:bg-[#1c1c1e] rounded-full p-1 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#1c1c1e]" title="{{ authService.isAdmin() ? 'Admin' : 'Verified User' }}">
                      <mat-icon class="{{ authService.isAdmin() ? 'text-amber-500' : 'text-blue-500' }}" style="font-size: 24px; width: 24px; height: 24px;">{{ authService.isAdmin() ? 'shield' : 'verified' }}</mat-icon>
                    </div>
                  }
                </div>
                <div class="pb-1 pt-2 sm:pt-0">
                  <h1 class="text-2xl sm:text-3xl font-black text-[#1d1d1f] dark:text-white leading-tight break-words flex items-center gap-2">
                    {{ authService.displayName() }}
                    @if (authService.userProfile()?.verified) {
                      <mat-icon 
                        (click)="authService.openVerificationModal()"
                        class="text-blue-500 cursor-pointer hover:scale-110 transition-transform" 
                        style="font-size: 24px; width: 24px; height: 24px;" 
                        title="View Verified Status">verified</mat-icon>
                    }
                  </h1>
                  <p class="text-[13px] sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 font-mono break-all sm:break-normal">
                    {{ authService.email() }}
                  </p>
                </div>
              </div>

              <!-- Role Badge -->
              <div class="pb-1 self-start sm:self-auto mt-1 sm:mt-0">
                @if (authService.isAdmin()) {
                  <span class="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-black tracking-wider uppercase shadow-md shadow-blue-500/20">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">verified</mat-icon>
                    <span>Admin</span>
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                    <span>Reader</span>
                  </span>
                }
              </div>
            </div>

            <!-- Profile Body / Details -->
            <div class="p-6 sm:p-10">
              
              <!-- Details View -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                
                <!-- Birthday Tile -->
                <div class="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                    <mat-icon>cake</mat-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#1d1d1f]/50 dark:text-white/50">Birthday (උපන් දිනය)</p>
                    <p class="text-base font-bold text-[#1d1d1f] dark:text-white font-mono">
                      {{ authService.birthday() || 'Not specified' }}
                    </p>
                  </div>
                </div>

                <!-- Bookmarked Articles Count -->
                <div class="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <mat-icon>bookmark</mat-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#1d1d1f]/50 dark:text-white/50">Saved Articles</p>
                    <p class="text-base font-bold text-[#1d1d1f] dark:text-white font-mono">
                      {{ bookmarkManager.bookmarkedIds().length }} Items
                    </p>
                  </div>
                </div>

                <!-- Account Type -->
                <div class="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <mat-icon>security</mat-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#1d1d1f]/50 dark:text-white/50">Account Status</p>
                    <p class="text-base font-bold text-[#1d1d1f] dark:text-white capitalize">
                      {{ authService.isAdmin() ? 'Administrator' : 'Standard Member' }}
                    </p>
                  </div>
                </div>

                <!-- Email Verification -->
                <div class="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <mat-icon>mark_email_read</mat-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-[#1d1d1f]/50 dark:text-white/50">Authentication</p>
                    <p class="text-base font-bold text-[#1d1d1f] dark:text-white">
                      {{ authService.currentUser()?.providerData?.[0]?.providerId === 'google.com' ? 'Google Sign-in' : 'Email & Password' }}
                    </p>
                  </div>
                </div>

              </div>

              <!-- Admin Quick Action Link -->
              @if (authService.isAdmin()) {
                <div class="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <mat-icon>admin_panel_settings</mat-icon>
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-[#1d1d1f] dark:text-white">Admin Control Panel</h4>
                      <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60 mt-0.5">Publish news, manage autopilot & analytics</p>
                    </div>
                  </div>
                  <a 
                    routerLink="/admin" 
                    class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md text-center">
                    Open Dashboard
                  </a>
                </div>
              }

              @if (!isEditingProfile()) {
                <!-- Action buttons -->
                <div class="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-black/5 dark:border-white/10">
                  <button 
                    type="button"
                    (click)="startEditingProfile()"
                    class="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">edit</mat-icon>
                    <span>Edit Profile (වෙනස් කරන්න)</span>
                  </button>
                  <button 
                    type="button"
                    (click)="handleLogout()"
                    class="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-rose-200 dark:border-rose-800/40 ml-auto">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">logout</mat-icon>
                    <span>Log Out</span>
                  </button>
                </div>
              } @else {
                <!-- Edit Profile Form -->
                <div class="mt-8 pt-8 border-t border-black/5 dark:border-white/10">
                  <form (ngSubmit)="saveProfileChanges()" class="space-y-6 max-w-2xl mx-auto">
                    <h3 class="text-xl font-bold text-[#1d1d1f] dark:text-white mb-2">Edit Your Profile</h3>
                  
                  <div>
                    <span class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-2">
                      Profile Picture (පැතිකඩ පින්තූරය)
                    </span>
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 shrink-0 overflow-hidden relative">
                        @if (editPhotoURL) {
                          <img [src]="editPhotoURL" alt="Profile Preview" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                        } @else {
                          <div class="w-full h-full flex items-center justify-center text-blue-500 font-bold text-xl bg-blue-50 dark:bg-blue-900/20">
                            {{ authService.userInitials() }}
                          </div>
                        }
                      </div>
                      <div class="flex-1">
                        <input type="file" id="photoInput" accept="image/*" class="hidden" (change)="onFileSelected($event)">
                        <label for="photoInput" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-xs font-bold cursor-pointer transition-colors inline-block">
                          Choose Image
                        </label>
                        <p class="text-[10px] text-gray-500 mt-1">Image will be resized automatically.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label for="editName" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-2">
                      Display Name (නම)
                    </label>
                    <input 
                      type="text" 
                      id="editName"
                      [(ngModel)]="editName" 
                      name="editName" 
                      required
                      class="w-full px-5 py-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>

                  <div>
                    <label for="editBirthday" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-2">
                      Birthday (උපන් දිනය)
                    </label>
                    <input 
                      type="date" 
                      id="editBirthday"
                      [(ngModel)]="editBirthday" 
                      name="editBirthday" 
                      max="2020-01-01"
                      min="1920-01-01"
                      class="w-full px-5 py-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>

                  <div>
                    <label for="editBio" class="block text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70 uppercase tracking-wider mb-2">
                      Short Bio (කෙටි විස්තරයක්)
                    </label>
                    <textarea 
                      id="editBio"
                      [(ngModel)]="editBio" 
                      name="editBio" 
                      rows="3"
                      placeholder="Tell us a bit about yourself..."
                      class="w-full px-5 py-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition-shadow"></textarea>
                  </div>

                  <div class="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                    <button 
                      type="submit" 
                      [disabled]="authService.isProcessing() || !editName"
                      class="w-full sm:w-auto flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      @if (authService.isProcessing()) {
                        <mat-icon class="animate-spin" style="font-size: 18px; width: 18px; height: 18px;">sync</mat-icon>
                        <span>Saving...</span>
                      } @else {
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">save</mat-icon>
                        <span>Save Changes</span>
                      }
                    </button>
                    <button 
                      type="button" 
                      (click)="cancelEditingProfile()"
                      class="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white font-bold text-sm cursor-pointer transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
                </div>
              }

            </div>

          </div>
        } @else {
          <!-- Not logged in state -->
          <div class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <mat-icon style="font-size: 40px; width: 40px; height: 40px;">account_circle</mat-icon>
            </div>
            <h2 class="text-2xl font-black text-[#1d1d1f] dark:text-white mb-3">Profile Access</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Please log in to your MyFeed.lk account to view and manage your profile details.</p>
            <button 
              (click)="authService.openAuthModal()"
              class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md">
              Log In to MyFeed.lk
            </button>
          </div>
        }
      </main>
      
    </div>
  `
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  readonly bookmarkManager = inject(BookmarkManager);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isEditingProfile = signal(false);
  editName = '';
  editBirthday = '';
  editBio = '';
  editPhotoURL = '';

  startEditingProfile() {
    this.editName = this.authService.displayName();
    this.editBirthday = this.authService.birthday();
    this.editBio = this.authService.userProfile()?.bio || '';
    this.editPhotoURL = this.authService.userProfile()?.photoURL || '';
    this.isEditingProfile.set(true);
  }

  cancelEditingProfile() {
    this.isEditingProfile.set(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          this.editPhotoURL = canvas.toDataURL('image/jpeg', 0.8);
          this.cdr.markForCheck();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = '';
    }
  }

  async saveProfileChanges() {
    if (!this.editName) return;
    const ok = await this.authService.updateProfileDetails({
      displayName: this.editName,
      birthday: this.editBirthday,
      bio: this.editBio,
      photoURL: this.editPhotoURL
    });
    if (ok) {
      this.isEditingProfile.set(false);
    }
  }

  async handleLogout() {
    await this.authService.signOutUser();
    this.router.navigate(['/']);
  }
}
