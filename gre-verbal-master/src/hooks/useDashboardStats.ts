import { useMemo } from 'react';
import { useAppStore, items, xpForLevel } from '@/store/useAppStore';
import { checkMastery, isStruggling } from '@/core/srs/sm2';
import { computeStudyPlan } from '@/core/planning/studyPlan';

export function useDashboardStats() {
  const cards = useAppStore((s) => s.cards);
  const progress = useAppStore((s) => s.progress);
  const dailyStats = useAppStore((s) => s.dailyStats);

  return useMemo(() => {
    const cardList = Object.values(cards);
    const totalItems = items.length;
    const itemsSolved = cardList.length;
    const itemsMastered = cardList.filter(checkMastery).length;
    const newItemsRemaining = totalItems - itemsSolved;
    const strugglingCount = cardList.filter(isStruggling).length;

    const totalCorrect = cardList.reduce((sum, c) => sum + c.timesCorrect, 0);
    const totalIncorrect = cardList.reduce((sum, c) => sum + c.timesIncorrect, 0);
    const totalReviews = totalCorrect + totalIncorrect;
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    const now = Date.now();
    const dueToday = cardList.filter((c) => c.nextReview <= now).length;

    const today = new Date().toISOString().slice(0, 10);
    const todayStat = dailyStats[today];

    const currentLevelFloor = progress.level === 1 ? 0 : xpForLevel(progress.level - 1);
    const nextLevelCeiling = xpForLevel(progress.level);
    const levelProgress =
      nextLevelCeiling > currentLevelFloor ? (progress.xp - currentLevelFloor) / (nextLevelCeiling - currentLevelFloor) : 1;

    const typesStarted = new Set(
      Object.keys(cards)
        .map((id) => items.find((i) => i.id === id)?.topic)
        .filter(Boolean),
    ).size;

    const passagesRead = new Set(
      Object.keys(cards)
        .map((id) => items.find((i) => i.id === id))
        .filter((i) => i && i.type === 'reading-comprehension')
        .map((i) => (i as { passageId: string }).passageId),
    ).size;

    const studyPlan = computeStudyPlan({
      testDate: progress.testDate,
      totalItems,
      itemsIntroduced: itemsSolved,
      itemsMastered,
      reviewsDueToday: dueToday,
      strugglingCount,
    });

    return {
      totalItems,
      itemsSolved,
      itemsMastered,
      newItemsRemaining,
      accuracy,
      dueToday,
      strugglingCount,
      todayNewItems: todayStat?.newItemsSolved ?? 0,
      dailyGoal: progress.dailyGoal,
      testDate: progress.testDate,
      studyPlan,
      xp: progress.xp,
      level: progress.level,
      levelProgress,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      totalReviewsAllTime: totalReviews,
      typesStarted,
      passagesRead,
    };
  }, [cards, progress, dailyStats]);
}
