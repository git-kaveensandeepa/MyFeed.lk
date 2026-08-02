import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeManager {
  readonly isDark = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('myfeed_theme');
      if (saved) {
        this.isDark.set(saved === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark.set(prefersDark);
      }
      this.updateDocumentClass();
    }
  }

  toggle() {
    this.isDark.update(d => {
      const next = !d;
      if (typeof window !== 'undefined') {
        localStorage.setItem('myfeed_theme', next ? 'dark' : 'light');
      }
      return next;
    });
    this.updateDocumentClass();
  }

  private updateDocumentClass() {
    if (typeof document !== 'undefined') {
      if (this.isDark()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
