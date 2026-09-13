import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { achievements, evaluateAchievements, type Achievement } from '@/core/gamification/achievements';

/**
 * Watches current progress, calls `unlockAchievements` for anything newly
 * earned, and keeps a small local queue of achievements to show as toasts.
 * Mounted once near the app root.
 */
export function useAchievementUnlocks() {
  const hydrated = useAppStore((s) => s.hydrated);
  const progress = useAppStore((s) => s.progress);
  const unlockAchievements = useAppStore((s) => s.unlockAchievements);
  const stats = useDashboardStats();

  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const knownRef = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    knownRef.current = new Set(progress.achievements);
    // First run after hydration just seeds the known set — no toast spam for
    // achievements the user already earned in a previous session.
    initialized.current = true;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !initialized.current) return;

    const earnedIds = evaluateAchievements({
      problemsSolved: stats.problemsSolved,
      problemsMastered: stats.problemsMastered,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalReviews: stats.totalReviewsAllTime,
      accuracy: stats.accuracy,
      level: stats.level,
      quizzesCompleted: progress.quizzesCompleted,
      topicsStarted: stats.topicsStarted,
      totalProblems: stats.totalProblems,
    });

    const freshlyEarned = earnedIds.filter((id) => !knownRef.current.has(id));
    if (freshlyEarned.length > 0) {
      freshlyEarned.forEach((id) => knownRef.current.add(id));
      unlockAchievements(freshlyEarned);
      const newAchievements = achievements.filter((a) => freshlyEarned.includes(a.id));
      setToastQueue((q) => [...q, ...newAchievements]);
    }
  }, [hydrated, stats, progress.quizzesCompleted, unlockAchievements]);

  const dismissToast = () => setToastQueue((q) => q.slice(1));

  return { currentToast: toastQueue[0] ?? null, dismissToast };
}
