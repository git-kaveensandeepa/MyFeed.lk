import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-[calc(100vh-200px)] animate-fade-in-up font-sans">
      <!-- Back Link -->
      <a routerLink="/" class="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#007AFF] transition-colors mb-8 cursor-pointer group">
        <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
        <span>Back to Home</span>
      </a>

      <!-- Header -->
      <header class="mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete_forever</mat-icon>
          <span>Account & Data Deletion Policy</span>
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-3">
          Delete Your Account & Data
        </h1>
        <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70 font-medium">
          App: <strong>MyFeed.lk - Tech & AI News</strong> &bull; Compliant with Google Play Store User Data & Deletion Policies
        </p>
      </header>

      <div class="space-y-8">
        <!-- Overview Card -->
        <section class="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-6 sm:p-8 border border-black/[0.08] dark:border-white/[0.1] shadow-sm">
          <h2 class="text-xl font-bold text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#007AFF]"></span>
            Our Commitment to Your Privacy
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/80 dark:text-white/80 leading-relaxed">
            At <strong>MyFeed.lk</strong>, we respect your privacy and right to complete data ownership. You have the absolute right to delete your account, your profile information, and all associated personal records at any time.
          </p>
        </section>

        <!-- Method 1: Delete via the App -->
        <section class="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-6 sm:p-8 border border-black/[0.08] dark:border-white/[0.1] shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">smartphone</mat-icon>
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-[#1d1d1f] dark:text-white">
                Method 1: Instant In-App Deletion (Fastest)
              </h2>
              <p class="text-xs text-[#8e8e93]">Permanently removes your account immediately</p>
            </div>
          </div>

          <p class="text-sm text-[#1d1d1f]/80 dark:text-white/80 mb-4">
            If you have the MyFeed.lk app installed on your phone or tablet:
          </p>

          <ol class="space-y-3 text-sm text-[#1d1d1f]/80 dark:text-white/80 pl-2">
            <li class="flex items-start gap-2.5">
              <span class="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Open the <strong>MyFeed.lk</strong> app on your Android or iOS device.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Go to the <strong>Account & Settings</strong> page (tap your profile icon or <a routerLink="/profile" class="text-[#007AFF] font-semibold underline">Profile</a>).</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Scroll down to the <strong>Account Actions</strong> section at the bottom.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
              <span>Tap <strong class="text-red-600 dark:text-red-400">"Delete Account & Data"</strong> and confirm. Your account and personal records are instantly and permanently erased.</span>
            </li>
          </ol>
        </section>

        <!-- Method 2: Web Deletion Request Form (For users who uninstalled the app) -->
        <section class="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-6 sm:p-8 border border-black/[0.08] dark:border-white/[0.1] shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">public</mat-icon>
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-[#1d1d1f] dark:text-white">
                Method 2: Online Deletion Request Form
              </h2>
              <p class="text-xs text-[#8e8e93]">For users who cannot access the app or have uninstalled it</p>
            </div>
          </div>

          <p class="text-sm text-[#1d1d1f]/80 dark:text-white/80 mb-5">
            If you no longer have the app installed or cannot log in, submit your request below. We will verify and process your deletion within 7 business days:
          </p>

          @if (submitted()) {
            <div class="p-5 rounded-[18px] bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300">
              <div class="flex items-center gap-2 font-bold mb-1">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">check_circle</mat-icon>
                <span>Request Submitted Successfully</span>
              </div>
              <p class="text-xs sm:text-sm">
                We have received your account deletion request for <strong>{{ requestEmail() }}</strong>. Our support team will verify and permanently delete your account and all associated data within 7 business days.
              </p>
              <p class="text-xs mt-2 text-[#8e8e93]">
                If you have urgent questions, contact: <a href="mailto:mail.kaveensandeepa@gmail.com" class="underline font-bold text-green-700 dark:text-green-300">mail.kaveensandeepa@gmail.com</a>
              </p>
            </div>
          } @else {
            <form (ngSubmit)="submitRequest()" class="space-y-4">
              <div>
                <label for="reqEmail" class="block text-xs font-bold uppercase tracking-wider text-[#8e8e93] mb-1.5">
                  Account Email Address *
                </label>
                <input 
                  type="email" 
                  id="reqEmail"
                  name="reqEmail"
                  [(ngModel)]="emailInput" 
                  placeholder="The email you used to register on MyFeed.lk" 
                  required
                  class="w-full px-4 py-3 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
              </div>

              <div>
                <label for="reqReason" class="block text-xs font-bold uppercase tracking-wider text-[#8e8e93] mb-1.5">
                  Reason / Additional Notes (Optional)
                </label>
                <textarea 
                  id="reqReason"
                  name="reqReason"
                  [(ngModel)]="reasonInput" 
                  rows="2" 
                  placeholder="Optional reason for deletion or specific data inquiries"
                  class="w-full px-4 py-3 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"></textarea>
              </div>

              @if (errorMessage()) {
                <p class="text-xs text-red-600 dark:text-red-400 font-medium">
                  {{ errorMessage() }}
                </p>
              }

              <button 
                type="submit" 
                [disabled]="isSubmitting() || !emailInput"
                class="w-full sm:w-auto px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                @if (isSubmitting()) {
                  <mat-icon class="animate-spin" style="font-size: 16px; width: 16px; height: 16px;">sync</mat-icon>
                  <span>Submitting Request...</span>
                } @else {
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete_forever</mat-icon>
                  <span>Submit Account Deletion Request</span>
                }
              </button>
            </form>
          }
        </section>

        <!-- Section 3: What data is deleted vs retained -->
        <section class="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-6 sm:p-8 border border-black/[0.08] dark:border-white/[0.1] shadow-sm">
          <h2 class="text-lg sm:text-xl font-bold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Types of Data That Will Be Deleted
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div class="p-4 rounded-[16px] bg-red-500/5 border border-red-500/10">
              <h3 class="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                Data Permanently Deleted:
              </h3>
              <ul class="space-y-1.5 text-[#1d1d1f]/70 dark:text-white/70 list-disc pl-5">
                <li>User Authentication Credentials & Email</li>
                <li>Display Name, Profile Photo & Bio</li>
                <li>Birthday information (if provided)</li>
                <li>Saved reading history & bookmarks</li>
                <li>Quiz participation scores & points</li>
                <li>User comments and feedback submissions</li>
              </ul>
            </div>

            <div class="p-4 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
              <h3 class="font-bold text-[#1d1d1f] dark:text-white mb-2 flex items-center gap-1.5">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">info</mat-icon>
                Data Retention & Timeline:
              </h3>
              <ul class="space-y-1.5 text-[#1d1d1f]/70 dark:text-white/70 list-disc pl-5">
                <li><strong>Retention:</strong> No personal or identifiable data is retained after deletion.</li>
                <li><strong>Timeline:</strong> In-app deletions take effect immediately. Web requests take up to 7 business days.</li>
                <li><strong>Backups:</strong> Any secondary system logs are purged in scheduled 30-day cycles.</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Section 4: Contact & Data Protection Officer -->
        <section class="bg-black/[0.02] dark:bg-white/[0.03] p-6 rounded-[24px] border border-black/5 dark:border-white/10 text-xs sm:text-sm">
          <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white mb-2">
            Developer & Data Controller Contact
          </h2>
          <p class="text-[#1d1d1f]/70 dark:text-white/70 mb-3">
            If you need assistance with an existing deletion request or have specific privacy inquiries, reach out directly:
          </p>
          <div class="space-y-1 text-[#1d1d1f] dark:text-white">
            <p><strong>App:</strong> MyFeed.lk (Tech & AI News)</p>
            <p><strong>Developer:</strong> Kaveen Sandeepa</p>
            <p><strong>Email:</strong> <a href="mailto:mail.kaveensandeepa@gmail.com" class="text-[#007AFF] hover:underline font-mono">mail.kaveensandeepa@gmail.com</a></p>
            <p><strong>WhatsApp / Phone:</strong> <a href="https://wa.me/94710947871" target="_blank" class="text-[#007AFF] hover:underline font-mono">+94 71 094 7871</a></p>
          </div>
        </section>
      </div>
    </main>
  `
})
export class DeleteAccountComponent {
  emailInput = '';
  reasonInput = '';
  readonly isSubmitting = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly requestEmail = signal<string>('');

  async submitRequest() {
    if (!this.emailInput || !this.emailInput.includes('@')) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await addDoc(collection(db, 'account_deletion_requests'), {
        email: this.emailInput.trim().toLowerCase(),
        reason: this.reasonInput.trim() || 'No reason provided',
        status: 'pending',
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent
      });

      this.requestEmail.set(this.emailInput.trim());
      this.submitted.set(true);
    } catch (err: any) {
      console.error('Account deletion request error:', err);
      // Fallback: If network or permission error, open mailto directly
      window.location.href = `mailto:mail.kaveensandeepa@gmail.com?subject=Account%20Deletion%20Request%20-%20MyFeed.lk&body=Please%20delete%20my%20account%20associated%20with%20email:%20${encodeURIComponent(this.emailInput)}.%20Reason:%20${encodeURIComponent(this.reasonInput)}`;
      this.requestEmail.set(this.emailInput.trim());
      this.submitted.set(true);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
