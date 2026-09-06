import { Injectable, signal, computed } from '@angular/core';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query } from 'firebase/firestore';
import { db } from './firebase';

export interface ChapterMark {
  timeFormatted?: string; // e.g. "01:30"
  seconds?: number;       // e.g. 90
  time?: number;          // alias for seconds
  title: string;         // e.g. "OpenAI Releases GPT-5 Mini with Offline Reasoning"
  category?: string;     // e.g. "AI & Robotics"
  summary?: string;      // 1-sentence note
  articleId?: string;    // linked article on MyFeed
}

export interface MorningEdition {
  id: string;
  editionNumber?: number;
  title: string;
  subTitle?: string;
  date?: string;              // "2026-08-27"
  dateFormatted?: string;     // "2026 අගෝස්තු 27 • බ්‍රහස්පතින්දා"
  windowStart?: string;       // "2026/08/26 04:00 AM"
  windowEnd?: string;         // "2026/08/27 04:00 AM"
  timeWindowText?: string;
  audioUrl: string;          // Direct MP3 URL or stream
  durationSeconds?: number;   // e.g. 915 (~15m 15s)
  durationFormatted?: string; // "15:15"
  narratorName?: string;      // "Kaveen Sandeepa (MyFeed AI Studio)"
  narratorRole?: string;     // "Host & Tech Editor"
  summarySinhala?: string;
  summary?: string;
  keyStoriesCount?: number;
  chapters: ChapterMark[];
  isFeatured?: boolean;
  listenCount?: number;
  publishedAt?: string;
}

// Fallback high-fidelity sample editions showcasing the exact requested 24-hr 4:00 AM -> 4:00 AM window
const INITIAL_MORNING_EDITIONS: MorningEdition[] = [
  {
    id: 'edition-2026-08-27',
    editionNumber: 42,
    title: 'MyFeed Daily Morning Tech Wrap',
    subTitle: '24-Hour Curated Audio Explainer for Morning Commuters',
    date: '2026-08-27',
    dateFormatted: '2026 අගෝස්තු 27 • බ්‍රහස්පතින්දා (Thursday Morning)',
    windowStart: '2026/08/26 04:00 AM',
    windowEnd: '2026/08/27 04:00 AM',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=news-ambient-112199.mp3', // High-fidelity royalty-free ambient news audio demo
    durationSeconds: 915, // 15 min 15 sec
    durationFormatted: '15:15',
    narratorName: 'Kaveen Sandeepa & MyFeed Tech Voice',
    narratorRole: 'Editor-in-Chief & AI Audio Studio',
    summarySinhala: 'පසුගිය පැය 24 (අගෝ 26 4:00 AM සිට අගෝ 27 4:00 AM දක්වා) තුළ My Feed LK හි පළවූ වැදගත්ම තාක්ෂණික පුවත් 7ක් පිළිබඳ විනාඩි 15ක සම්පූර්ණ හඬ විග්‍රහය. කාර්යාලයට යන අතරතුර සවන් දෙන්න.',
    keyStoriesCount: 7,
    isFeatured: true,
    listenCount: 1420,
    publishedAt: '2026-08-27T04:15:00.000Z',
    chapters: [
      {
        timeFormatted: '00:00',
        seconds: 0,
        title: 'Morning Brief Headlines & 24-Hr Overview',
        category: 'Highlights',
        summary: 'පසුගිය පැය 24 තුළ ගෝලීය සහ ශ්‍රී ලාංකික තාක්ෂණික ලෝකයේ ප්‍රධාන පෙරළි පිළිබඳ කෙටි හැඳින්වීම.'
      },
      {
        timeFormatted: '01:30',
        seconds: 90,
        title: 'OpenAI Releases GPT-5 Mini with Local Edge Reasoning',
        category: 'AI & Machine Learning',
        summary: 'අන්තර්ජාල සම්බන්ධතාවක් නොමැතිව Device එක තුළම Reasoning ධාවනය කළ හැකි නව AI මාදිලිය පිළිබඳ විග්‍රහය.'
      },
      {
        timeFormatted: '04:15',
        seconds: 255,
        title: 'ශ්‍රී ලංකාවේ Starlink චන්ද්‍රිකා අන්තර්ජාල ව්‍යාපෘතියේ නවතම අදියර',
        category: 'Sri Lanka Tech',
        summary: 'ලංකාවේ දුරබැහැර ප්‍රදේශ ආවරණය වන පරිදි සැටලයිට් ග්‍රවුන්ඩ් ස්ටේෂන් ඉදිකිරීම් පිළිබඳ තොරතුරු.'
      },
      {
        timeFormatted: '07:20',
        seconds: 440,
        title: 'Apple M5 Silicon: Next-Gen 3nm Architecture Leaks',
        category: 'Hardware & Chips',
        summary: 'ලබන වසරේ එන Mac Studio සහ MacBook Pro සඳහා නිර්මාණය වන M5 ප්‍රොසෙසරයේ Neural Engine බලය.'
      },
      {
        timeFormatted: '10:05',
        seconds: 605,
        title: 'Google AI Studio & Antigravity Cloud Updates',
        category: 'Cloud & Dev',
        summary: 'Developer වරුන් සඳහා Angular සහ Full-stack Apps තැනීමට හඳුන්වාදුන් නව මෙවලම් කට්ටලය.'
      },
      {
        timeFormatted: '12:40',
        seconds: 760,
        title: 'දේශීය IT රැකියා වෙළඳපොළ සහ AI Adoption Trends',
        category: 'Career & Tech',
        summary: 'ශ්‍රී ලාංකික තොරතුරු තාක්ෂණ වෘත්තිකයින් දැනගත යුතු අලුත්ම AI කුසලතා සහ වැටුප් ප්‍රවණතා.'
      },
      {
        timeFormatted: '14:25',
        seconds: 865,
        title: 'Tomorrow Tech Watch & Wrap-up',
        category: 'Conclusion',
        summary: 'අද දවසේ සාරාංශය සහ හෙට උදෑසන 4:00 AM බලාපොරොත්තු විය හැකි විශේෂ ප්‍රවෘත්ති.'
      }
    ]
  },
  {
    id: 'edition-2026-08-26',
    editionNumber: 41,
    title: 'MyFeed Daily Morning Tech Wrap',
    subTitle: 'Yesterday Morning 15-Min Commute Brief',
    date: '2026-08-26',
    dateFormatted: '2026 අගෝස්තු 26 • බදාදා (Wednesday Morning)',
    windowStart: '2026/08/25 04:00 AM',
    windowEnd: '2026/08/26 04:00 AM',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=news-ambient-112199.mp3',
    durationSeconds: 890,
    durationFormatted: '14:50',
    narratorName: 'Kaveen Sandeepa & MyFeed Tech Voice',
    narratorRole: 'Editor-in-Chief',
    summarySinhala: 'අගෝස්තු 25 4:00 AM සිට අගෝස්තු 26 4:00 AM දක්වා පැය 24 තුළ ලොව පුරා සිදුවූ විශේෂ AI, Cybersecurity සහ Tech Gadget සිදුවීම් පිළිබඳ විනාඩි 15ක විග්‍රහය.',
    keyStoriesCount: 6,
    isFeatured: false,
    listenCount: 2310,
    publishedAt: '2026-08-26T04:15:00.000Z',
    chapters: [
      {
        timeFormatted: '00:00',
        seconds: 0,
        title: 'Headlines Summary & Morning Intro',
        category: 'Highlights'
      },
      {
        timeFormatted: '02:00',
        seconds: 120,
        title: 'Global Cybersecurity Alert: Zero-day Browser Exploits',
        category: 'Cybersecurity'
      },
      {
        timeFormatted: '05:30',
        seconds: 330,
        title: 'Tesla Robotaxi Autonomous Fleet Expansion',
        category: 'EV & Mobility'
      },
      {
        timeFormatted: '09:10',
        seconds: 550,
        title: 'Sri Lanka Digital ID (NDID) Integration Milestones',
        category: 'GovTech'
      },
      {
        timeFormatted: '13:00',
        seconds: 780,
        title: 'Tech Wrap-up & Productivity Tip',
        category: 'Conclusion'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioElement: HTMLAudioElement | null = null;
  private sleepTimerId: any = null;

  // Reactive State Signals
  readonly editions = signal<MorningEdition[]>(INITIAL_MORNING_EDITIONS);
  readonly currentEdition = signal<MorningEdition | null>(null);
  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly playbackRate = signal<number>(1.0);
  readonly isBuffering = signal<boolean>(false);
  readonly volume = signal<number>(1.0);
  readonly isMuted = signal<boolean>(false);
  readonly carMode = signal<boolean>(false);
  readonly sleepTimerMinutes = signal<number | null>(null);
  readonly showFullPlayerModal = signal<boolean>(false);

  // Computed state
  readonly featuredEdition = computed(() => {
    const list = this.editions();
    return list.find(e => e.isFeatured) || list[0] || null;
  });

  readonly latestEdition = computed(() => {
    return this.featuredEdition();
  });

  readonly currentChapter = computed(() => {
    const edition = this.currentEdition();
    const currentSec = this.currentTime();
    if (!edition || !edition.chapters || edition.chapters.length === 0) return null;

    // Find the latest chapter whose seconds <= currentSec
    let active = edition.chapters[0];
    for (const chapter of edition.chapters) {
      const markSec = typeof chapter.seconds === 'number' ? chapter.seconds : (chapter.time || 0);
      if (currentSec >= markSec) {
        active = chapter;
      } else {
        break;
      }
    }
    return active;
  });

  readonly progressPercent = computed(() => {
    const d = this.duration();
    const c = this.currentTime();
    if (!d || d <= 0) return 0;
    return Math.min(100, (c / d) * 100);
  });

  readonly formattedCurrentTime = computed(() => {
    return this.formatSeconds(this.currentTime());
  });

  readonly formattedDuration = computed(() => {
    return this.formatSeconds(this.duration());
  });

  readonly formattedRemainingTime = computed(() => {
    const rem = Math.max(0, this.duration() - this.currentTime());
    return '-' + this.formatSeconds(rem);
  });

  // Backward compatibility alias for currentEdition
  readonly currentEpisode = computed(() => {
    return this.currentEdition();
  });

  constructor() {
    this.initAudioElement();
    this.loadEditionsFromFirestore();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';

    this.audioElement.addEventListener('play', () => {
      this.isPlaying.set(true);
      this.updateMediaSessionState();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying.set(false);
      this.updateMediaSessionState();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime.set(this.audioElement.currentTime);
        if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          this.duration.set(this.audioElement.duration);
        }
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
        this.duration.set(this.audioElement.duration);
      }
      this.isBuffering.set(false);
    });

    this.audioElement.addEventListener('waiting', () => {
      this.isBuffering.set(true);
    });

    this.audioElement.addEventListener('playing', () => {
      this.isBuffering.set(false);
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.currentTime.set(0);
      this.updateMediaSessionState();
    });

    this.setupMediaSession();
  }

  // Load from Firestore
  async loadEditionsFromFirestore() {
    try {
      const q = query(collection(db, 'audio_editions'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const loaded: MorningEdition[] = [];
        snapshot.forEach(d => {
          const data = d.data() as any;
          loaded.push({
            id: d.id,
            editionNumber: data.editionNumber || 1,
            title: data.title || 'MyFeed Morning Tech Wrap',
            subTitle: data.subTitle || '15-Min Commute Brief',
            date: data.date || new Date().toISOString().split('T')[0],
            dateFormatted: data.dateFormatted || data.date,
            windowStart: data.windowStart || '2026/08/26 04:00 AM',
            windowEnd: data.windowEnd || '2026/08/27 04:00 AM',
            audioUrl: data.audioUrl || '',
            durationSeconds: data.durationSeconds || 900,
            durationFormatted: data.durationFormatted || '15:00',
            narratorName: data.narratorName || 'Kaveen Sandeepa',
            narratorRole: data.narratorRole || 'Editor-in-Chief',
            summarySinhala: data.summarySinhala || '',
            keyStoriesCount: data.keyStoriesCount || (data.chapters ? data.chapters.length : 6),
            chapters: data.chapters || [],
            isFeatured: !!data.isFeatured,
            listenCount: data.listenCount || 0,
            publishedAt: data.publishedAt || new Date().toISOString()
          });
        });

        // Sort descending by date
        loaded.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
        this.editions.set(loaded);
      }
    } catch (e) {
      console.warn('Audio editions loaded with fallback initial items:', e);
    }
  }

  // Save new edition to Firestore (Admin)
  async saveEdition(edition: Partial<MorningEdition>): Promise<string> {
    const id = edition.id || `edition-${Date.now()}`;
    const cleanData: any = {
      ...edition,
      id,
      publishedAt: edition.publishedAt || new Date().toISOString(),
      listenCount: edition.listenCount || 0
    };

    const docRef = doc(db, 'audio_editions', id);
    await setDoc(docRef, cleanData, { merge: true });

    // Update local state
    await this.loadEditionsFromFirestore();
    return id;
  }

  // Delete edition (Admin)
  async deleteEdition(id: string): Promise<void> {
    await deleteDoc(doc(db, 'audio_editions', id));
    this.editions.update(list => list.filter(e => e.id !== id));
    if (this.currentEdition()?.id === id) {
      this.pause();
      this.currentEdition.set(null);
    }
  }

  // Playback Control
  playEdition(edition: MorningEdition, startSeconds = 0) {
    if (!this.audioElement) {
      this.initAudioElement();
    }
    if (!this.audioElement) return;

    const isSameTrack = this.currentEdition()?.id === edition.id;
    this.currentEdition.set(edition);
    this.duration.set(edition.durationSeconds || 0);

    if (!isSameTrack || this.audioElement.src !== edition.audioUrl) {
      this.audioElement.src = edition.audioUrl;
      this.audioElement.load();
      if (startSeconds > 0) {
        this.audioElement.currentTime = startSeconds;
      }
    } else if (startSeconds > 0) {
      this.audioElement.currentTime = startSeconds;
    }

    this.audioElement.playbackRate = this.playbackRate();
    this.audioElement.play().catch(err => {
      console.warn('Audio playback was prevented by browser policy:', err);
    });

    this.updateMediaSessionMetadata(edition);

    // Increment listen count
    this.incrementListenCount(edition.id);
  }

  togglePlay() {
    if (!this.audioElement) return;
    if (this.isPlaying()) {
      this.pause();
    } else {
      if (!this.currentEdition()) {
        const featured = this.featuredEdition();
        if (featured) {
          this.playEdition(featured);
        }
      } else {
        this.audioElement.play().catch(e => console.warn(e));
      }
    }
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.duration()));
      this.currentTime.set(this.audioElement.currentTime);
    }
  }

  seekToPercent(percent: number) {
    const target = (percent / 100) * this.duration();
    this.seek(target);
  }

  skip(secondsDelta: number) {
    if (this.audioElement) {
      this.seek(this.audioElement.currentTime + secondsDelta);
    }
  }

  skipForward(seconds = 10) {
    this.skip(seconds);
  }

  skipBackward(seconds = 10) {
    this.skip(-seconds);
  }

  async loadEditions() {
    return this.loadEditionsFromFirestore();
  }

  seekToChapter(chapter: ChapterMark) {
    const sec = typeof chapter.seconds === 'number' ? chapter.seconds : (chapter.time || 0);
    this.seek(sec);
    if (!this.isPlaying()) {
      const cur = this.currentEdition();
      if (cur) this.playEdition(cur, sec);
    }
  }

  setSpeed(rate: number) {
    this.playbackRate.set(rate);
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  cycleSpeed() {
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.8];
    const current = this.playbackRate();
    const nextIdx = (speeds.indexOf(current) + 1) % speeds.length;
    this.setSpeed(speeds[nextIdx]);
  }

  toggleCarMode() {
    this.carMode.update(v => !v);
  }

  setSleepTimer(minutes: number | null) {
    this.sleepTimerMinutes.set(minutes);
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }

    if (minutes && minutes > 0) {
      this.sleepTimerId = setTimeout(() => {
        this.pause();
        this.sleepTimerMinutes.set(null);
      }, minutes * 60 * 1000);
    }
  }

  openFullPlayer() {
    this.showFullPlayerModal.set(true);
  }

  closeFullPlayer() {
    this.showFullPlayerModal.set(false);
  }

  // MediaSession API Integration for Bluetooth, Car screens & Lock screen
  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      this.skip(-(details.seekOffset || 15));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      this.skip(details.seekOffset || 15);
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });
  }

  private updateMediaSessionMetadata(edition: MorningEdition) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${edition.title} (${edition.windowStart} - ${edition.windowEnd})`,
      artist: edition.narratorName || 'My Feed LK Morning Audio',
      album: 'MyFeed Tech Commute 15-Min Briefings',
      artwork: [
        { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }

  private updateMediaSessionState() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = this.isPlaying() ? 'playing' : 'paused';
  }

  private async incrementListenCount(editionId: string) {
    try {
      const docRef = doc(db, 'audio_editions', editionId);
      await updateDoc(docRef, {
        listenCount: (this.currentEdition()?.listenCount || 0) + 1
      });
    } catch {
      // ignore
    }
  }

  private formatSeconds(sec: number): string {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
