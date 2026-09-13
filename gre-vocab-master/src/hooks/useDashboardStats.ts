import { useMemo } from 'react';
import { useAppStore, words } from '@/store/useAppStore';
import { xpForLevel } from '@/store/useAppStore';
import { checkMastery, isLearned, isStruggling } from '@/core/srs/sm2';
import { computeStudyPlan } from '@/core/planning/studyPlan';

export function useDashboardStats() {
  const cards = useAppStore((s) => s.cards);
  const progress = useAppStore((s) => s.progress);
  const dailyStats = useAppStore((s) => s.dailyStats);

  return useMemo(() => {
    const cardList = Object.values(cards);
    const totalWords = words.length;
    // "Introduced" = has been shown at least once, regardless of how it went —
    // used for pacing (how many new words are left to introduce), not for
    // claiming the word is actually known.
    const wordsIntroduced = cardList.length;
    // "Learned" = has survived a second, spaced retrieval and isn't currently
    // struggling — see isLearned() for why one "Hard" press doesn't qualify.
    const wordsLearned = cardList.filter(isLearned).length;
    const wordsMastered = cardList.filter(checkMastery).length;
    const newWordsRemaining = totalWords - wordsIntroduced;
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
      nextLevelCeiling > currentLevelFloor
        ? (progress.xp - currentLevelFloor) / (nextLevelCeiling - currentLevelFloor)
        : 1;

    const studyPlan = computeStudyPlan({
      testDate: progress.testDate,
      totalWords,
      wordsIntroduced,
      wordsMastered,
      reviewsDueToday: dueToday,
      strugglingCount,
    });

    return {
      totalWords,
      wordsIntroduced,
      wordsLearned,
      wordsMastered,
      newWordsRemaining,
      accuracy,
      dueToday,
      strugglingCount,
      todayNewWords: todayStat?.newWordsLearned ?? 0,
      dailyGoal: progress.dailyGoal,
      testDate: progress.testDate,
      studyPlan,
      xp: progress.xp,
      level: progress.level,
      levelProgress,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      totalReviewsAllTime: totalReviews,
    };
  }, [cards, progress, dailyStats]);
}
