/**
 * Every persistence concern in the app goes through this interface.
 * Feature code never touches `localStorage` (or, later, Firebase/Supabase)
 * directly — it always talks to a `StorageAdapter`. To move to a real
 * backend, implement this interface once (e.g. `FirebaseAdapter`) and
 * swap it in at the composition root (`store/index.ts`). No feature
 * code needs to change.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

const NAMESPACE = 'gre-quant-master:';

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(NAMESPACE + key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(NAMESPACE + key);
  }

  async clear(): Promise<void> {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(NAMESPACE))
      .forEach((k) => localStorage.removeItem(k));
  }
}

// Singleton used throughout the app today. Swapping to a backend later
// means changing this one line (or making it conditional on auth state).
export const storage: StorageAdapter = new LocalStorageAdapter();
