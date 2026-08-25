import {ChangeDetectionStrategy, Component, signal, inject, OnInit, computed} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterOutlet, RouterLink} from '@angular/router';
import {SearchService} from './search.service';
import {SubscriberService} from './subscriber.service';
import {ThemeManager} from './theme';
import {BookmarkManager} from './bookmark';
import {ArticleService} from './article.service';
import {TickerService} from './ticker.service';
import {PwaService} from './pwa.service';
import {WebPushService} from './web-push.service';

import {AnalyticsService} from './analytics.service';
import {ToolsService} from './tools.service';
import {ToolsDrawerComponent} from './tools-drawer.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [MatIconModule, RouterOutlet, RouterLink, ToolsDrawerComponent],
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
  readonly toolsService = inject(ToolsService);
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
}
