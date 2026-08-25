import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { doc, setDoc, arrayUnion, onSnapshot, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from './firebase';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  
  // Signal to store today's live unique visitors for the admin dashboard
  todayLiveVisitors = signal<number>(0);
  
  private _isTracking = false;

  trackDeviceVisit() {
    if (!isPlatformBrowser(this.platformId) || this._isTracking) return;
    this._isTracking = true;
    
    try {
      const today = new Date();
      // Adjust to Sri Lanka Time (approx UTC+5:30) to align "today" correctly
      const slTime = new Date(today.getTime() + (5.5 * 60 * 60 * 1000));
      const dateString = slTime.toISOString().split('T')[0]; // YYYY-MM-DD
      
      let deviceId = localStorage.getItem('myfeed_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem('myfeed_device_id', deviceId);
      }
      
      const lastTracked = localStorage.getItem('myfeed_last_tracked_date');
      if (lastTracked !== dateString) {
        // Record visit
        const ref = doc(db, 'analytics', dateString);
        setDoc(ref, { 
          visitors: arrayUnion(deviceId),
          lastUpdated: new Date().toISOString()
        }, { merge: true }).then(() => {
          localStorage.setItem('myfeed_last_tracked_date', dateString);
        }).catch((err: unknown) => console.error('Failed to track analytics:', err));
      }
    } catch (e) {
      console.warn('Analytics tracking error', e);
    }
  }

  listenToTodayVisitors() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const today = new Date();
    const slTime = new Date(today.getTime() + (5.5 * 60 * 60 * 1000));
    const dateString = slTime.toISOString().split('T')[0];
    
    const ref = doc(db, 'analytics', dateString);
    onSnapshot(ref, (snap: DocumentSnapshot) => {
      if (snap.exists()) {
        const data = snap.data();
        const visitors = data ? data['visitors'] || [] : [];
        this.todayLiveVisitors.set(visitors.length);
      } else {
        this.todayLiveVisitors.set(0);
      }
    }, (error: FirestoreError) => {
      console.error('Error listening to analytics', error);
    });
  }
}

