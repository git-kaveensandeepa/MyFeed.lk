import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lk.myfeed.app',
  appName: 'MyFeed LK',
  webDir: 'dist/app/browser',
  server: {
    androidScheme: 'https',
    url: 'https://ais-pre-wkbrkijpyogfl6rf4zj5d5-110393045040.asia-east1.run.app',
    cleartext: true
  }
};

export default config;
