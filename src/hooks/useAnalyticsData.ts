import { useMemo } from 'react';
import { useAppStore, words } from '@/store/useAppStore';
import { checkMastery, isStruggling } from '@/core/srs/sm2';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function useAnalyticsData(daysBack = 14) {
  const dailyStats = useAppStore((s) => s.dailyStats);
  const cards = useAppStore((s) => s.cards);

  return useMemo(() => {
    const dailySeries = Array.from({ length: daysBack }, (_, i) => {
      const date = isoDaysAgo(daysBack - 1 - i);
      const stat = dailyStats[date];
      const reviews = stat?.reviews ?? 0;
      const correct = stat?.correct ?? 0;
      const accuracy = reviews > 0 ? Math.round((correct / reviews) * 100) : 0;
      return {
        date: date.slice(5), // MM-DD
        reviews,
        newWords: stat?.newWordsLearned ?? 0,
        accuracy,
      };
    });

    const cardList = Object.values(cards);
    const mastered = cardList.filter(checkMastery).length;
    const struggling = cardList.filter((c) => isStruggling(c) && !checkMastery(c)).length;
    const learning = cardList.length - mastered - struggling;
    const notStarted = words.length - cardList.length;

    const masteryBreakdown = [
      { name: 'Mastered', value: mastered, color: 'var(--color-verdigris)' },
      { name: 'Learning', value: learning, color: 'var(--color-gold)' },
      { name: 'Struggling', value: struggling, color: 'var(--color-rust)' },
      { name: 'Not started', value: notStarted, color: 'var(--color-slate)' },
    ];

    const difficultyCounts: Record<string, { total: number; learned: number }> = {
      easy: { total: 0, learned: 0 },
      medium: { total: 0, learned: 0 },
      hard: { total: 0, learned: 0 },
    };
    for (const w of words) {
      difficultyCounts[w.difficulty].total += 1;
      if (cards[w.id]) difficultyCounts[w.difficulty].learned += 1;
    }
    const difficultyBreakdown = Object.entries(difficultyCounts).map(([difficulty, v]) => ({
      difficulty,
      total: v.total,
      learned: v.learned,
    }));

    const totalReviews = cardList.reduce((sum, c) => sum + c.timesCorrect + c.timesIncorrect, 0);
    const totalCorrect = cardList.reduce((sum, c) => sum + c.timesCorrect, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return { dailySeries, masteryBreakdown, difficultyBreakdown, overallAccuracy, totalReviews };
  }, [dailyStats, cards, daysBack]);
}
