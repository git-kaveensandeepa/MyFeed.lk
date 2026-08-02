import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookmarkManager {
  readonly bookmarkedIds = signal<string[]>([]);

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('myfeed_bookmarks');
        if (saved) {
          this.bookmarkedIds.set(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load bookmarks', e);
      }
    }
  }

  isBookmarked(id: string): boolean {
    return this.bookmarkedIds().includes(id);
  }

  toggleBookmark(id: string) {
    this.bookmarkedIds.update(ids => {
      let next: string[];
      if (ids.includes(id)) {
        next = ids.filter(item => item !== id);
      } else {
        next = [...ids, id];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('myfeed_bookmarks', JSON.stringify(next));
      }
      return next;
    });
  }
}
