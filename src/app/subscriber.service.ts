import { Injectable, signal } from '@angular/core';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Subscriber {
  id: string;
  email: string;
  createdAt?: unknown;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {
  private _subscribers = signal<Subscriber[]>([]);
  private _loading = signal<boolean>(false);
  private _quotaExceeded = signal<boolean>(false);

  readonly subscribers = this._subscribers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly quotaExceeded = this._quotaExceeded.asReadonly();

  async subscribe(email: string): Promise<void> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      const colRef = collection(db, 'subscribers');
      await addDoc(colRef, {
        email: trimmed,
        active: true,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      if (error && (error.message?.includes('Quota exceeded') || error.code === 'resource-exhausted')) {
        throw new Error('Our database subscription quota has been reached for today. Please try again tomorrow.');
      }
      throw error;
    }
  }

  async loadSubscribers(): Promise<void> {
    this._loading.set(true);
    try {
      const q = query(collection(db, 'subscribers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: Subscriber[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Subscriber);
      });
      this._subscribers.set(list);
      this._quotaExceeded.set(false);
      try {
        localStorage.setItem('myfeed_cached_subscribers', JSON.stringify(list));
      } catch (_) {}
    } catch (error: any) {
      console.error('Error loading subscribers:', error);
      if (error && (error.message?.includes('Quota exceeded') || error.code === 'resource-exhausted')) {
        this._quotaExceeded.set(true);
      }
      
      // Fallback to cached subscribers
      try {
        const cached = localStorage.getItem('myfeed_cached_subscribers');
        if (cached) {
          this._subscribers.set(JSON.parse(cached));
        }
      } catch (_) {}
    } finally {
      this._loading.set(false);
    }
  }

  async deleteSubscriber(id: string): Promise<void> {
    const docRef = doc(db, 'subscribers', id);
    await deleteDoc(docRef);
    await this.loadSubscribers();
  }
}
