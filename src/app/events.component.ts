import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-transparent text-[#000000] dark:text-white transition-colors duration-300 pb-36 pt-3 sm:pt-6">
      
      <main class="max-w-3xl w-full mx-auto px-4 sm:px-6">
        
        <!-- Navigation Bar Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <a routerLink="/" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full ios-glass-thin text-xs font-bold text-[#007AFF] hover:opacity-80 transition-opacity ios-touch">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">chevron_left</mat-icon>
              <span>Journal</span>
            </a>
          </div>
          
          <div class="text-center">
            <h1 class="text-base sm:text-lg font-bold text-[#000000] dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              <mat-icon class="text-[#FF9500]" style="font-size: 20px; width: 20px; height: 20px;">event_upcoming</mat-icon>
              <span>Tech Events &amp; Meetups</span>
            </h1>
          </div>

          <!-- Submit Event Action -->
          <button 
            (click)="openSubmitModal()"
            class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full ios-glass-thin hover:bg-black/10 dark:hover:bg-white/15 text-[#007AFF] text-xs font-bold transition-all cursor-pointer ios-touch">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
            <span class="hidden sm:inline">Submit Event</span>
          </button>
        </div>

        <!-- Coming Soon Hero Card -->
        <div class="relative overflow-hidden rounded-[26px] bg-white dark:bg-[#1c1c1e] text-[#000000] dark:text-white p-6 sm:p-10 shadow-sm border border-black/[0.06] dark:border-white/[0.08] text-center mb-8 ios-card">
          
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-5 shadow-inner">
            <mat-icon style="font-size: 36px; width: 36px; height: 36px;">event_upcoming</mat-icon>
          </div>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            <span>Coming Soon</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Sri Lanka Tech Events Hub
          </h2>

          <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-6">
            ශ්‍රී ලංකාවේ ප්‍රමුඛතම Hackathons, Meetups, Tech Conferences සහ Workshops සියල්ල එකම තැනකින් දැනගැනීමට සහ ලියාපදිංචි වීමට හැකි Event Calendar එක ළඟදීම ඔබ වෙතට.
          </p>

          <!-- What to expect list -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto mb-8">
            <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <mat-icon class="text-amber-500 mb-1" style="font-size: 20px; width: 20px; height: 20px;">calendar_month</mat-icon>
              <div class="text-xs font-bold text-gray-900 dark:text-white">Community Calendar</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Google Calendar sync &amp; reminders</div>
            </div>

            <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <mat-icon class="text-blue-500 mb-1" style="font-size: 20px; width: 20px; height: 20px;">qr_code_2</mat-icon>
              <div class="text-xs font-bold text-gray-900 dark:text-white">Direct RSVP Passes</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Instant registration links &amp; passes</div>
            </div>

            <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <mat-icon class="text-emerald-500 mb-1" style="font-size: 20px; width: 20px; height: 20px;">groups</mat-icon>
              <div class="text-xs font-bold text-gray-900 dark:text-white">Host &amp; Promote</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Free event publishing for organizers</div>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href="https://whatsapp.com/channel/0029Vb92r0OEawdtkqTARr2V" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all ios-touch cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span>Get WhatsApp Notifications</span>
            </a>

            <button 
              (click)="openSubmitModal()"
              class="w-full sm:w-auto px-6 py-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ios-touch cursor-pointer">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">campaign</mat-icon>
              <span>Submit an Event to List</span>
            </button>
          </div>
        </div>

      </main>

      <!-- Submit Event Sheet Modal -->
      @if (showSubmitModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-black/10 dark:border-white/10 relative text-left">
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">event</mat-icon>
                </div>
                <h3 class="text-base font-bold text-[#000000] dark:text-white">Submit Tech Event</h3>
              </div>
              <button 
                (click)="closeSubmitModal()"
                class="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-gray-500 flex items-center justify-center hover:opacity-70 transition-opacity">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
              </button>
            </div>

            <p class="text-xs text-[#8e8e93] mb-4">
              ඔබගේ තාක්ෂණික Meetup හෝ Event එක My Feed LK හි නොමිලේ පළ කිරීමට පහත විස්තර ඇතුළත් කර අපගේ WhatsApp කණ්ඩායමට යොමු කරන්න.
            </p>

            <form (ngSubmit)="submitCommunityEvent()" class="space-y-3">
              <div>
                <label for="eventTitleInput" class="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Event Title *</label>
                <input 
                  id="eventTitleInput"
                  type="text" 
                  [(ngModel)]="newEventTitle" 
                  name="eventTitle" 
                  required
                  placeholder="e.g. Sri Lanka AI Meetup 2026"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
              </div>

              <div>
                <label for="eventOrganizerInput" class="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Organizer / Company</label>
                <input 
                  id="eventOrganizerInput"
                  type="text" 
                  [(ngModel)]="newEventOrganizer" 
                  name="eventOrganizer" 
                  placeholder="e.g. GDG Sri Lanka / University"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
              </div>

              <div>
                <label for="eventVenueInput" class="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Date &amp; Venue</label>
                <input 
                  id="eventVenueInput"
                  type="text" 
                  [(ngModel)]="newEventVenue" 
                  name="eventVenue" 
                  placeholder="e.g. Next Saturday &bull; Colombo / Online"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
              </div>

              <div class="pt-2 flex items-center gap-2">
                <button 
                  type="button"
                  (click)="closeSubmitModal()"
                  class="flex-1 py-2.5 rounded-full bg-black/5 dark:bg-white/10 font-bold text-xs text-gray-600 dark:text-gray-300">
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="flex-1 py-2.5 rounded-full bg-[#007AFF] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">send</mat-icon>
                  <span>Submit via WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class EventsComponent {
  readonly showSubmitModal = signal<boolean>(false);
  newEventTitle = '';
  newEventOrganizer = '';
  newEventVenue = '';

  openSubmitModal() {
    this.showSubmitModal.set(true);
  }

  closeSubmitModal() {
    this.showSubmitModal.set(false);
  }

  submitCommunityEvent() {
    if (!this.newEventTitle.trim()) return;

    const formattedText = `*My Feed LK Event Submission*\n\n` +
      `📅 *Event Name:* ${this.newEventTitle}\n` +
      `🏢 *Organizer:* ${this.newEventOrganizer || 'Community'}\n` +
      `📍 *Date & Venue:* ${this.newEventVenue || 'Sri Lanka / Online'}\n\n` +
      `Sent via My Feed LK Events Hub`;

    const encoded = encodeURIComponent(formattedText);
    const waUrl = `https://wa.me/94710947871?text=${encoded}`;

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    this.closeSubmitModal();
    this.newEventTitle = '';
    this.newEventOrganizer = '';
    this.newEventVenue = '';
  }
}
