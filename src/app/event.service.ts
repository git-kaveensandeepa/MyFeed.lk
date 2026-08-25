import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  collection, 
  onSnapshot,
  doc, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface TechEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  type: 'apple' | 'google' | 'samsung' | 'esports' | 'local' | 'other';
  link?: string;
  isOnline?: boolean;
  createdAt?: unknown;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly events = signal<TechEvent[]>([]);
  readonly loading = signal<boolean>(true);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      onSnapshot(collection(db, 'events'), (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TechEvent[];
        
        // Sort by date ascending
        eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        this.events.set(eventsData);
        this.loading.set(false);
      }, (error) => {
        console.error('Error listening to events:', error);
        this.loading.set(false);
      });
    }
  }

  async addEvent(event: Omit<TechEvent, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'events'), {
        ...event,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, data: Partial<TechEvent>) {
    try {
      const docRef = doc(db, 'events', id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string) {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async seedPresets() {
    const presets: Omit<TechEvent, 'id' | 'createdAt'>[] = [
      {
        title: 'Apple Special Event (iPhone & Watch Launch)',
        date: '2026-09-09',
        time: '10:00 AM PT / 10:30 PM SLST',
        location: 'Apple Park, Cupertino & Live Stream',
        description: 'Apple introduces the new generation iPhone series, Apple Watch Ultra, and latest Apple Intelligence features.',
        type: 'apple',
        link: 'https://www.apple.com/apple-events/',
        isOnline: true
      },
      {
        title: 'Google I/O & Gemini AI Keynote',
        date: '2026-10-04',
        time: '10:00 AM PT',
        location: 'Mountain View, CA & Online',
        description: 'Google presents next-gen Gemini AI models, Android updates, Pixel innovations, and developer tools.',
        type: 'google',
        link: 'https://io.google/',
        isOnline: true
      },
      {
        title: 'Samsung Galaxy Unpacked (Next Gen Foldables & AI)',
        date: '2026-10-25',
        time: '7:00 PM SLST',
        location: 'Seoul & Global Live Stream',
        description: 'Samsung reveals the future of foldables, Galaxy AI enhancements, and new Galaxy wearables.',
        type: 'samsung',
        link: 'https://www.samsung.com/global/galaxy/events/unpacked/',
        isOnline: true
      },
      {
        title: 'Sri Lanka National Esports Championship 2026',
        date: '2026-11-14',
        time: '9:00 AM SLST',
        location: 'BMICH, Colombo, Sri Lanka',
        description: 'The biggest gaming & esports festival in Sri Lanka with PUBG Mobile, Valorant, Dota 2, and Mobile Legends.',
        type: 'esports',
        link: 'https://gamer.lk',
        isOnline: false
      }
    ];

    for (const preset of presets) {
      await this.addEvent(preset);
    }
  }
}
