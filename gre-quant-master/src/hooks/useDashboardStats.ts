import { useMemo } from 'react';
import { useAppStore, problems } from '@/store/useAppStore';
import { xpForLevel } from '@/store/useAppStore';
import { checkMastery } from '@/core/srs/sm2';
import { computeStudyPlan } from '@/core/planning/studyPlan';

function isStruggling(card: { easeFactor: number; timesIncorrect: number }): boolean {
  return card.easeFactor <= 1.5 || card.timesIncorrect >= 2;
}

export function useDashboardStats() {
  const cards = useAppStore((s) => s.cards);
  const progress = useAppStore((s) => s.progress);
  const dailyStats = useAppStore((s) => s.dailyStats);

  return useMemo(() => {
    const cardList = Object.values(cards);
    const totalProblems = problems.length;
    const problemsSolved = cardList.length;
    const problemsMastered = cardList.filter(checkMastery).length;
    const newProblemsRemaining = totalProblems - problemsSolved;
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

    const topicsStarted = new Set(
      Object.keys(cards)
        .map((id) => problems.find((p) => p.id === id)?.topic)
        .filter(Boolean),
    ).size;

    const studyPlan = computeStudyPlan({
      testDate: progress.testDate,
      totalProblems,
      problemsIntroduced: problemsSolved,
      problemsMastered,
      reviewsDueToday: dueToday,
      strugglingCount,
    });

    return {
      totalProblems,
      problemsSolved,
      problemsMastered,
      newProblemsRemaining,
      accuracy,
      dueToday,
      strugglingCount,
      todayNewProblems: todayStat?.newProblemsSolved ?? 0,
      dailyGoal: progress.dailyGoal,
      testDate: progress.testDate,
      studyPlan,
      xp: progress.xp,
      level: progress.level,
      levelProgress,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      totalReviewsAllTime: totalReviews,
      topicsStarted,
    };
  }, [cards, progress, dailyStats]);
}
