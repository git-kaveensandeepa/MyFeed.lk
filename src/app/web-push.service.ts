import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

@Injectable({
  providedIn: 'root'
})
export class WebPushService {
  private platformId = inject(PLATFORM_ID);
  
  // Matched VAPID Public Key
  readonly VAPID_PUBLIC_KEY = 'BGAgbaEbbGpuE92I7FiigT8999bHBAfgsZNcr7ayNUuAE3KTpSGKbKtbjRPo8_f96hTzCvGv0nzUX8I5dBH8-0g';
  
  isSupported = false;
  isSubscribed = signal<boolean>(false);
  isDenied = signal<boolean>(false);
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      if (this.isSupported && Notification.permission === 'denied') {
        this.isDenied.set(true);
      }
      this.checkSubscription();
    }
  }
  
  async checkSubscription() {
    if (!this.isSupported) return;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      this.isSubscribed.set(!!subscription);
    } catch (e) {
      console.error('SW registration check error', e);
    }
  }

  async subscribe(): Promise<boolean> {
    if (!this.isSupported) return false;
    
    // Check if running inside an iframe (like AI Studio preview)
    if (window.self !== window.top) {
      alert("Push notifications are restricted inside preview iframes by browser security policies.\n\nPlease open MyFeed in a new browser tab to enable push notifications.");
      this.isDenied.set(true);
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        this.isDenied.set(true);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // If there was an old subscription with previous keys, unsubscribe it first
      const oldSub = await registration.pushManager.getSubscription();
      if (oldSub) {
        try {
          await oldSub.unsubscribe();
        } catch {
          // ignore
        }
      }

      const convertedVapidKey = this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      const subJson = JSON.parse(JSON.stringify(subscription));
      const colRef = collection(db, 'web_push_subscriptions');
      const q = query(colRef, where('endpoint', '==', subJson.endpoint));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(colRef, {
          ...subJson,
          userAgent: navigator.userAgent || '',
          createdAt: serverTimestamp()
        });
      }
      
      this.isSubscribed.set(true);
      this.isDenied.set(false);
      return true;
    } catch (e) {
      console.error('Subscription error', e);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
