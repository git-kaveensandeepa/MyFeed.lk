import {Injectable, signal} from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeManager {
  readonly isDark = signal<boolean>(false);
  readonly currentMode = signal<ThemeMode>('system');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('myfeed_theme_mode') as ThemeMode | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        this.setMode(saved);
      } else {
        const legacy = localStorage.getItem('myfeed_theme');
        if (legacy === 'dark' || legacy === 'light') {
          this.setMode(legacy);
        } else {
          this.setMode('system');
        }
      }

      if (typeof window.matchMedia === 'function') {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', () => {
          if (this.currentMode() === 'system') {
            this.applySystemTheme();
          }
        });
      }
    }
  }

  setMode(mode: ThemeMode) {
    this.currentMode.set(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('myfeed_theme_mode', mode);
      localStorage.setItem('myfeed_theme', mode === 'dark' ? 'dark' : (mode === 'light' ? 'light' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')));
    }
    if (mode === 'system') {
      this.applySystemTheme();
    } else {
      this.isDark.set(mode === 'dark');
      this.updateDocumentClass();
    }
  }

  private applySystemTheme() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(prefersDark);
    } else {
      this.isDark.set(false);
    }
    this.updateDocumentClass();
  }

  toggle() {
    const next = this.isDark() ? 'light' : 'dark';
    this.setMode(next);
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
