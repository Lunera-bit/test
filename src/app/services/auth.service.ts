import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth!: Auth;
  private user$ = new BehaviorSubject<User | null>(null);
  public authState$: Observable<User | null> = this.user$.asObservable();

  constructor() {
    // Inicializar Firebase sólo si hace falta (main.ts ya puede hacerlo, pero por seguridad)
    if (!getApps().length) {
      initializeApp(environment.firebase);
    }
    this.auth = getAuth();
    onAuthStateChanged(this.auth, (u) => this.user$.next(u));
  }

  async signInEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUpEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async sendPasswordReset(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      return await signInWithPopup(this.auth, provider);
    } catch {
      return signInWithRedirect(this.auth, provider);
    }
  }

  async signInWithApple() {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      return await signInWithPopup(this.auth, provider);
    } catch {
      return signInWithRedirect(this.auth, provider);
    }
  }

  async logout() {
    return signOut(this.auth);
  }

  currentUser(): User | null {
    return this.auth.currentUser;
  }
}