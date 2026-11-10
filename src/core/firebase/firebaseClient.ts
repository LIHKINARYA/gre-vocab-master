import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';
import type { AppState } from '@/core/types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection on boot per guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline client mode.');
    }
    return false;
  }
}

// Auth helpers
export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Cloud sync helpers
export async function loadUserCloudState(userId: string): Promise<AppState | null> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'appState');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        cards: data.cards || {},
        progress: data.progress || {},
        dailyStats: data.dailyStats || {},
      } as AppState;
    }
    return null;
  } catch (err) {
    console.error('Failed to load user cloud state:', err);
    return null;
  }
}

export async function saveUserCloudState(userId: string, state: AppState): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'appState');
    await setDoc(docRef, {
      cards: state.cards,
      progress: state.progress,
      dailyStats: state.dailyStats,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save user cloud state:', err);
  }
}
