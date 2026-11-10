import { useState, useEffect } from 'react';
import { 
  auth, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser,
  loadUserCloudState,
  saveUserCloudState 
} from '@/core/firebase/firebaseClient';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAppStore } from '@/store/useAppStore';

export function useAuthSync() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const cards = useAppStore((s) => s.cards);
  const progress = useAppStore((s) => s.progress);
  const dailyStats = useAppStore((s) => s.dailyStats);
  const importData = useAppStore((s) => s.importData);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Upon user login, fetch their cloud state and merge
        try {
          setSyncing(true);
          const cloudState = await loadUserCloudState(currentUser.uid);
          if (cloudState && Object.keys(cloudState.cards || {}).length > 0) {
            // If local has fewer cards or cloud has more progress, offer or merge
            const localCount = Object.keys(cards).length;
            const cloudCount = Object.keys(cloudState.cards).length;
            
            // If cloud has data, sync it down into store
            if (cloudCount >= localCount) {
              importData(JSON.stringify(cloudState));
            } else {
              // Local has more fresh progress, push to cloud
              await saveUserCloudState(currentUser.uid, { cards, progress, dailyStats });
            }
          } else if (Object.keys(cards).length > 0) {
            // First time login with existing local study progress -> upload to cloud
            await saveUserCloudState(currentUser.uid, { cards, progress, dailyStats });
          }
        } catch (err) {
          console.error('Error during initial auth sync:', err);
        } finally {
          setSyncing(false);
        }
      }
    });

    return () => unsub();
  }, [cards, progress, dailyStats, importData]);

  // Sync to cloud on local state change if user logged in
  const syncToCloud = async () => {
    if (!user) return;
    try {
      setSyncing(true);
      await saveUserCloudState(user.uid, { cards, progress, dailyStats });
      setSyncError(null);
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return {
    user,
    loading,
    syncing,
    syncError,
    syncToCloud,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logoutUser,
  };
}
