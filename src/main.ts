import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';

// Handle dynamic module chunk loading errors gracefully across deployments and dev server rebuilds
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    console.warn('[ChunkLoader] Preload chunk error detected, reloading page to fetch latest build...');
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module')
    ) {
      console.warn('[ChunkLoader] Dynamic module import error:', msg);
      const storageKey = 'myfeed_last_chunk_reload';
      const now = Date.now();
      const last = Number(sessionStorage.getItem(storageKey) || 0);
      if (now - last > 4000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
