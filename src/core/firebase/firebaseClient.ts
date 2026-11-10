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
import type { AppState } from '@/core/types';

// Load config dynamically so a gitignored local file doesn't break builds in fresh clones
const localConfigFiles = import.meta.glob<{ default: Record<string, string> }>('/firebase-applet-config.json', { eager: true });
const localConfig = localConfigFiles['/firebase-applet-config.json']?.default || {};
const env = import.meta.env;

export const firebaseConfig = {
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string) || localConfig.projectId || '',
  appId: (env.VITE_FIREBASE_APP_ID as string) || localConfig.appId || '',
  apiKey: (env.VITE_FIREBASE_API_KEY as string) || localConfig.apiKey || '',
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || localConfig.authDomain || '',
  firestoreDatabaseId: (env.VITE_FIREBASE_DATABASE_ID as string) || localConfig.firestoreDatabaseId || '',
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET as string) || localConfig.storageBucket || '',
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || localConfig.messagingSenderId || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  !firebaseConfig.apiKey.includes('Placeholder')
);

const app = !getApps().length
  ? initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'AIzaPlaceholderForDevelopmentOnly',
            projectId: 'placeholder-project',
            appId: '1:000000000000:web:0000000000000000000000',
          }
    )
  : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection on boot per guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isFirebaseConfigured) {
    return false;
  }
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
