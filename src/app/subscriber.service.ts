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

  readonly subscribers = this._subscribers.asReadonly();
  readonly loading = this._loading.asReadonly();

  async subscribe(email: string): Promise<void> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    const colRef = collection(db, 'subscribers');
    await addDoc(colRef, {
      email: trimmed,
      active: true,
      createdAt: serverTimestamp()
    });
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
    } catch (error) {
      console.error('Error loading subscribers:', error);
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
