import {ChangeDetectionStrategy, Component, signal, inject, HostListener, OnInit, computed} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterOutlet, RouterLink} from '@angular/router';
import {SearchService} from './search.service';
import {SubscriberService} from './subscriber.service';
import {ThemeManager} from './theme';
import {BookmarkManager} from './bookmark';
import {ArticleService} from './article.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [MatIconModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class App implements OnInit {
  readonly searchService = inject(SearchService);
  readonly subscriberService = inject(SubscriberService);
  readonly themeManager = inject(ThemeManager);
  readonly bookmarkManager = inject(BookmarkManager);
  readonly articleService = inject(ArticleService);
  
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

  ngOnInit() {
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

  @HostListener('window:contextmenu', ['$event'])
  onContextMenu(event: Event) {
    event.preventDefault();
  }

  @HostListener('window:copy', ['$event'])
  @HostListener('window:cut', ['$event'])
  onCopyCut(event: Event) {
    event.preventDefault();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'PrintScreen') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText('');
      }
      event.preventDefault();
    }
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      // Block common shortcuts for copy, print, save, inspect
      if (key === 'c' || key === 'p' || key === 's' || key === 'u' || key === 'x') {
        event.preventDefault();
      }
    }
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'PrintScreen') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText('');
      }
    }
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
