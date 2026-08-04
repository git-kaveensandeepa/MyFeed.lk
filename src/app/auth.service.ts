import { Injectable, signal, computed } from '@angular/core';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.email === 'mail.kaveensandeepa@gmail.com');

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this._user.set(user);
    });
  }

  async signUp(email: string, pass: string) {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}
