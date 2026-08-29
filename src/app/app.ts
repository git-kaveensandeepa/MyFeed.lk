import {ChangeDetectionStrategy, Component, signal, inject, OnInit, computed} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {SearchService} from './search.service';
import {SubscriberService} from './subscriber.service';
import {ThemeManager} from './theme';
import {BookmarkManager} from './bookmark';
import {ArticleService} from './article.service';
import {TickerService} from './ticker.service';
import {PwaService} from './pwa.service';
import {WebPushService} from './web-push.service';
import {AnalyticsService} from './analytics.service';
import {AuthService} from './auth.service';
import {AuthModalComponent} from './auth-modal.component';
import {AudioMiniPlayerComponent} from './audio-mini-player.component';
import {AudioService} from './audio.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [MatIconModule, RouterOutlet, RouterLink, RouterLinkActive, AuthModalComponent, AudioMiniPlayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '(window:copy)': 'preventCopy($event)',
    '(window:cut)': 'preventCopy($event)',
    '(window:contextmenu)': 'preventContextMenu($event)'
  }
})
export class App implements OnInit {
  readonly authService = inject(AuthService);
  readonly audioService = inject(AudioService);
  readonly searchService = inject(SearchService);
  readonly subscriberService = inject(SubscriberService);
  readonly themeManager = inject(ThemeManager);
  readonly bookmarkManager = inject(BookmarkManager);
  readonly articleService = inject(ArticleService);
  readonly tickerService = inject(TickerService);
  readonly pwaService = inject(PwaService);
  readonly webPushService = inject(WebPushService);
  readonly analyticsService = inject(AnalyticsService);
  
  showSplash = signal(true);
  splashFading = signal(false);
  showScrollButton = signal(false);
  subscribing = signal(false);
  subscribeSuccess = signal(false);
  subscribeError = signal<string | null>(null);
  showReadingList = signal(false);
  showFeedbackModal = signal(false);
  feedbackCategory = signal<'issue' | 'recommendation' | 'content' | 'general'>('issue');
  feedbackMessage = signal('');

  readonly bookmarkedArticles = computed(() => {
    const ids = this.bookmarkManager.bookmarkedIds();
    return this.articleService.articles().filter(a => ids.includes(a.id));
  });

  preventCopy(event: ClipboardEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    // Allow copy inside input fields, textareas, or admin panel
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('.admin-panel') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }
    event.preventDefault();
  }

  preventContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    // Allow right click in input fields, textareas, or admin panel
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('.admin-panel')
    ) {
      return;
    }
    event.preventDefault();
  }

  ngOnInit() {
    this.analyticsService.trackDeviceVisit();
    
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.splashFading.set(true);
        setTimeout(() => {
          this.showSplash.set(false);
        }, 600);
      }, 1600);
    } else {
      this.showSplash.set(false);
    }
  }

  toggleReadingList() {
    this.showReadingList.update(v => !v);
  }

  onWindowScroll() {
    if (typeof window !== 'undefined') {
      this.showScrollButton.set(window.scrollY > 400);
    }
  }

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }

  async subscribeNewsletter(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.elements.namedItem('email') as HTMLInputElement;
    if (!input || !input.value) return;

    this.subscribing.set(true);
    this.subscribeError.set(null);
    this.subscribeSuccess.set(false);

    try {
      await this.subscriberService.subscribe(input.value);
      this.subscribeSuccess.set(true);
      form.reset();
      setTimeout(() => {
        this.subscribeSuccess.set(false);
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Subscription failed. Please try again.';
      this.subscribeError.set(msg);
    } finally {
      this.subscribing.set(false);
    }
  }

  toggleFeedbackModal() {
    this.showFeedbackModal.update(v => !v);
  }

  setFeedbackCategory(category: 'issue' | 'recommendation' | 'content' | 'general') {
    this.feedbackCategory.set(category);
  }

  updateFeedbackMessage(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.feedbackMessage.set(target.value);
  }

  sendFeedbackViaWhatsApp() {
    const categoryLabels: Record<string, string> = {
      issue: '🐞 Website Issue / Bug Report (වෙබ් අඩවියේ ගැටලුවක්)',
      recommendation: '💡 Recommendation / Feature Suggestion (යෝජනාවක් / අදහසක්)',
      content: '📰 News / Content Feedback (පුවත් පිළිබඳව)',
      general: '💬 General Feedback / Inquiry (වෙනත්)'
    };

    const category = categoryLabels[this.feedbackCategory()] || 'Feedback';
    const message = this.feedbackMessage().trim() || 'No additional comment provided.';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://myfeedlk.com';

    const text = `*MyFeed.lk Feedback & Support*\n\n📌 *Category:* ${category}\n💬 *Message:* ${message}\n🔗 *Page URL:* ${currentUrl}\n\n_Sent via MyFeed.lk Support Portal_`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/94710947871?text=${encodedText}`;

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }

    this.showFeedbackModal.set(false);
    this.feedbackMessage.set('');
  }
}
