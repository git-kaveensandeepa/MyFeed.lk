import { Injectable, signal, computed } from '@angular/core';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, getCountFromServer, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  birthday?: string; // Format: YYYY-MM-DD
  role: 'admin' | 'reader' | 'editor';
  photoURL?: string;
  bio?: string;
  banned?: boolean;
  verified?: boolean;
  memberNumber?: number;
  lastSeen?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly userProfile = signal<UserProfile | null>(null);
  readonly loading = signal<boolean>(true);
  readonly isProcessing = signal<boolean>(false);
  readonly authError = signal<string | null>(null);
  readonly authSuccess = signal<string | null>(null);

  // Modal dialog states
  readonly showAuthModal = signal<boolean>(false);
  readonly authModalTab = signal<'login' | 'signup' | 'forgot'>('login');
  
  // Verification Modal states
  readonly verificationModalOpen = signal<boolean>(false);
  readonly memberRank = signal<number | null>(null);

  async openVerificationModal() {
    this.verificationModalOpen.set(true);
    this.memberRank.set(null);
    let profile = this.userProfile();

    try {
      if (profile && profile.uid) {
        // Fetch fresh profile to ensure createdAt is a materialized Timestamp instead of a FieldValue
        const userRef = doc(db, 'users', profile.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          profile = snapshot.data() as UserProfile;
        }
      }
      
      if (profile?.memberNumber) {
        this.memberRank.set(profile.memberNumber);
      } else if (profile?.createdAt && typeof (profile.createdAt as any).seconds === 'number') {
        const q = query(collection(db, 'users'), where('createdAt', '<=', profile.createdAt));
        const countSnap = await getCountFromServer(q);
        this.memberRank.set(countSnap.data().count);
      } else {
        // Fallback if createdAt is not available or not yet materialized
        const q = query(collection(db, 'users'));
        const countSnap = await getCountFromServer(q);
        this.memberRank.set(countSnap.data().count);
      }
    } catch (err) {
      console.warn('Error fetching rank:', err);
      this.memberRank.set(1);
    }
  }

  closeVerificationModal() {
    this.verificationModalOpen.set(false);
  }

  // Computed helper states
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    const profile = this.userProfile();
    return user?.email === 'mail.kaveensandeepa@gmail.com' || profile?.role === 'admin';
  });

  readonly displayName = computed(() => {
    return this.userProfile()?.displayName || 
           this.currentUser()?.displayName || 
           this.currentUser()?.email?.split('@')[0] || 
           'Reader';
  });

  readonly userInitials = computed(() => {
    const name = this.displayName().trim();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  readonly birthday = computed(() => {
    return this.userProfile()?.birthday || '';
  });

  readonly email = computed(() => {
    return this.currentUser()?.email || this.userProfile()?.email || '';
  });

  constructor() {
    if (typeof window !== 'undefined') {
      onAuthStateChanged(auth, async (user) => {
        this.currentUser.set(user);
        if (user) {
          await this.fetchOrInitUserProfile(user);
        } else {
          this.userProfile.set(null);
        }
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  openAuthModal(tab: 'login' | 'signup' | 'forgot' = 'login') {
    this.authError.set(null);
    this.authSuccess.set(null);
    this.authModalTab.set(tab);
    this.showAuthModal.set(true);
  }

  closeAuthModal() {
    this.showAuthModal.set(false);
    this.authError.set(null);
    this.authSuccess.set(null);
  }

  setAuthTab(tab: 'login' | 'signup' | 'forgot') {
    this.authError.set(null);
    this.authSuccess.set(null);
    this.authModalTab.set(tab);
  }

  async fetchOrInitUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        if (data.banned) {
          await signOut(auth);
          this.currentUser.set(null);
          this.userProfile.set(null);
          this.authError.set('ඔබගේ ගිණුම තහනම් කර ඇත.');
          return null;
        }

        let updates: Partial<UserProfile> = { lastSeen: serverTimestamp() };

        // Retroactively add verified badge to early adopters if they don't have it explicitly set yet
        if (data.verified === undefined || data.memberNumber === undefined) {
           try {
             let isVerified = data.verified;
             let memberNumber = data.memberNumber;

             if (isVerified === undefined || memberNumber === undefined) {
               if (data.createdAt) {
                 const q = query(collection(db, 'users'), where('createdAt', '<=', data.createdAt));
                 const countSnap = await getCountFromServer(q);
                 memberNumber = countSnap.data().count;
               } else {
                 const q = query(collection(db, 'users'), orderBy('memberNumber', 'desc'), limit(1));
                 const snap = await getDocs(q);
                 if (!snap.empty) {
                   memberNumber = (snap.docs[0].data() as UserProfile).memberNumber || 0;
                   memberNumber += 1;
                 } else {
                   memberNumber = 1;
                 }
               }
               isVerified = memberNumber <= 500;
             }

             updates.verified = isVerified;
             updates.memberNumber = memberNumber;
             data.verified = isVerified;
             data.memberNumber = memberNumber;
           } catch(e) {
             console.warn('Count server error:', e);
           }
        }
        
        await updateDoc(userRef, updates);

        const updatedData = { ...data, lastSeen: new Date() };

        this.userProfile.set(updatedData);
        return updatedData;
      } else {
        // Find highest member number for first 500 early adopters badge
        let isVerified = false;
        let memberNumber = 1;
        try {
          const q = query(collection(db, 'users'), orderBy('memberNumber', 'desc'), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            memberNumber = (snap.docs[0].data() as UserProfile).memberNumber || 0;
            memberNumber += 1;
          }
          if (memberNumber <= 500) {
            isVerified = true;
          }
        } catch (e) {
          console.warn('Could not get user count', e);
        }

        // Create initial user document if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'MyFeed Member',
          birthday: '',
          role: user.email === 'mail.kaveensandeepa@gmail.com' ? 'admin' : 'reader',
          photoURL: user.photoURL || '',
          bio: '',
          banned: false,
          verified: isVerified,
          memberNumber: memberNumber,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, initialProfile);
        this.userProfile.set(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.warn('Error fetching or initializing user profile:', err);
      // Fallback local memory profile
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Reader',
        birthday: '',
        role: user.email === 'mail.kaveensandeepa@gmail.com' ? 'admin' : 'reader'
      };
      this.userProfile.set(fallback);
      return fallback;
    }
  }

  /**
   * User Sign Up with Email, Password, Full Name, and Birthday
   */
  async signUpWithEmail(
    emailInput: string, 
    passwordInput: string, 
    nameInput: string, 
    birthdayInput: string
  ): Promise<boolean> {
    this.isProcessing.set(true);
    this.authError.set(null);
    this.authSuccess.set(null);

    const email = emailInput.trim().toLowerCase();
    const displayName = nameInput.trim();
    const birthday = birthdayInput.trim();

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, passwordInput);
      const user = userCredential.user;

      // 2. Update Firebase Auth display name
      if (displayName) {
        try {
          await updateProfile(user, { displayName });
        } catch (e) {
          console.warn('Could not update Auth profile displayName:', e);
        }
      }

      // 3. Save comprehensive profile to Firestore
      let isVerified = false;
      let memberNumber = 1;
      try {
        const q = query(collection(db, 'users'), orderBy('memberNumber', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          memberNumber = (snap.docs[0].data() as UserProfile).memberNumber || 0;
          memberNumber += 1;
        }
        if (memberNumber <= 500) {
          isVerified = true;
        }
      } catch (e) {
        console.warn('Could not get max user count', e);
      }

      const newProfile: UserProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        birthday: birthday || '',
        role: email === 'mail.kaveensandeepa@gmail.com' ? 'admin' : 'reader',
        photoURL: '',
        bio: '',
        banned: false,
        verified: isVerified,
        memberNumber: memberNumber,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      this.userProfile.set(newProfile);

      this.authSuccess.set('ගිණුම සාර්ථකව සාදන ලදී! (Account created successfully!)');
      setTimeout(() => {
        this.closeAuthModal();
      }, 1200);
      return true;
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      this.authError.set(this.formatErrorMessage(err));
      return false;
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * User Sign In with Email and Password
   */
  async signInWithEmail(emailInput: string, passwordInput: string): Promise<boolean> {
    this.isProcessing.set(true);
    this.authError.set(null);
    this.authSuccess.set(null);

    const email = emailInput.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, passwordInput);
      await this.fetchOrInitUserProfile(userCredential.user);

      this.authSuccess.set('සාර්ථකව ලොග් විය! (Successfully signed in!)');
      setTimeout(() => {
        this.closeAuthModal();
      }, 1000);
      return true;
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      this.authError.set(this.formatErrorMessage(err));
      return false;
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Password Reset Email
   */
  async sendPasswordReset(emailInput: string): Promise<boolean> {
    this.isProcessing.set(true);
    this.authError.set(null);
    this.authSuccess.set(null);

    const email = emailInput.trim().toLowerCase();

    try {
      await sendPasswordResetEmail(auth, email);
      this.authSuccess.set(`මුරපදය නැවත සැකසීමේ ලින්ක් එක (${email}) ලිපිනයට යවන ලදී. කරුණාකර ඔබගේ Inbox පරීක්ෂා කරන්න.`);
      return true;
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      this.authError.set(this.formatErrorMessage(err));
      return false;
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Update Profile Details (Name, Birthday, Bio)
   */
  async updateProfileDetails(data: { displayName: string; birthday?: string; bio?: string; photoURL?: string }): Promise<boolean> {
    const user = this.currentUser();
    if (!user) return false;

    this.isProcessing.set(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updates: Partial<UserProfile> = {
        displayName: data.displayName.trim(),
        birthday: data.birthday?.trim() || '',
        bio: data.bio?.trim() || '',
        updatedAt: serverTimestamp()
      };
      if (data.photoURL !== undefined) {
        updates.photoURL = data.photoURL;
      }

      await updateDoc(userRef, updates);

      // Update in Firebase Auth instance
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (data.displayName.trim() && user.displayName !== data.displayName.trim()) {
        authUpdates.displayName = data.displayName.trim();
      }
      if (data.photoURL !== undefined && user.photoURL !== data.photoURL) {
        authUpdates.photoURL = data.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        try {
          await updateProfile(user, authUpdates);
        } catch (e) {
          console.warn('Auth profile sync error:', e);
        }
      }

      this.userProfile.update(prev => {
        if (!prev) return null;
        return {
          ...prev,
          displayName: data.displayName.trim(),
          birthday: data.birthday?.trim() || '',
          bio: data.bio?.trim() || '',
          ...(data.photoURL !== undefined && { photoURL: data.photoURL })
        };
      });

      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Sign Out
   */
  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser.set(null);
      this.userProfile.set(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }

  private formatErrorMessage(err: unknown): string {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'කරුණාකර නිවැරදි ඊමේල් ලිපිනයක් ඇතුළත් කරන්න. (Invalid email format)';
      case 'auth/user-not-found':
        return 'මෙම ඊමේල් ලිපිනයට අදාළ ගිණුමක් සොයාගත නොහැකි විය. (Account not found)';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'ඇතුළත් කළ මුරපදය හෝ ඊමේල් ලිපිනය වැරදිය. කරුණාකර නැවත උත්සාහ කරන්න. (Incorrect email or password)';
      case 'auth/email-already-in-use':
        return 'මෙම ඊමේල් ලිපිනයෙන් දැනටමත් ගිණුමක් පවතී. කරුණාකර Log In වන්න. (Email already registered)';
      case 'auth/weak-password':
        return 'මුරපදය ප්‍රමාණවත් තරම් ශක්තිමත් නැත. අකුරු 6 කට වඩා ඇතුළත් කරන්න. (Password should be at least 6 characters)';
      case 'auth/too-many-requests':
        return 'වැඩි වාර ගණනක් උත්සාහ කර ඇත. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න. (Too many attempts. Try again later.)';
      case 'auth/network-request-failed':
        return 'අන්තර්ජාල සම්බන්ධතාවයේ දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න. (Network connection error)';
      default:
        return (err as { message?: string })?.message || 'ක්‍රියාවලිය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.';
    }
  }
}
