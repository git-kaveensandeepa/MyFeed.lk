import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class HapticService {
  private platformId = inject(PLATFORM_ID);

  private isSupported(): boolean {
    return isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  lightImpact() {
    if (this.isSupported()) navigator.vibrate(10);
  }

  mediumImpact() {
    if (this.isSupported()) navigator.vibrate(25);
  }

  heavyImpact() {
    if (this.isSupported()) navigator.vibrate(50);
  }

  selection() {
    if (this.isSupported()) navigator.vibrate(15);
  }

  success() {
    if (this.isSupported()) navigator.vibrate([10, 30, 20]);
  }
}
