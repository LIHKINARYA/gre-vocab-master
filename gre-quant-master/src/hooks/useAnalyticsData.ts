import { useMemo } from 'react';
import { useAppStore, problems } from '@/store/useAppStore';
import { checkMastery } from '@/core/srs/sm2';
import type { CardState, ProblemTopic } from '@/core/types';

function isStruggling(card: CardState): boolean {
  return card.easeFactor <= 1.5 || card.timesIncorrect >= 2;
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const topicLabels: Record<ProblemTopic, string> = {
  arithmetic: 'Arithmetic',
  algebra: 'Algebra',
  geometry: 'Geometry',
  'data-analysis': 'Data Analysis',
  'word-problems': 'Word Problems',
};

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
        newProblems: stat?.newProblemsSolved ?? 0,
        accuracy,
      };
    });

    const cardList = Object.values(cards);
    const mastered = cardList.filter(checkMastery).length;
    const struggling = cardList.filter((c) => isStruggling(c) && !checkMastery(c)).length;
    const learning = cardList.length - mastered - struggling;
    const notStarted = problems.length - cardList.length;

    const masteryBreakdown = [
      { name: 'Mastered', value: mastered, color: 'var(--color-verdigris)' },
      { name: 'Learning', value: learning, color: 'var(--color-gold)' },
      { name: 'Struggling', value: struggling, color: 'var(--color-rust)' },
      { name: 'Not started', value: notStarted, color: 'var(--color-slate)' },
    ];

    const difficultyCounts: Record<string, { total: number; attempted: number }> = {
      easy: { total: 0, attempted: 0 },
      medium: { total: 0, attempted: 0 },
      hard: { total: 0, attempted: 0 },
    };
    for (const p of problems) {
      difficultyCounts[p.difficulty].total += 1;
      if (cards[p.id]) difficultyCounts[p.difficulty].attempted += 1;
    }
    const difficultyBreakdown = Object.entries(difficultyCounts).map(([difficulty, v]) => ({
      difficulty,
      total: v.total,
      attempted: v.attempted,
    }));

    const topicStats: Record<string, { correct: number; total: number }> = {};
    for (const topic of Object.keys(topicLabels) as ProblemTopic[]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    for (const p of problems) {
      const card = cards[p.id];
      if (!card) continue;
      topicStats[p.topic].correct += card.timesCorrect;
      topicStats[p.topic].total += card.timesCorrect + card.timesIncorrect;
    }
    const topicAccuracy = (Object.keys(topicLabels) as ProblemTopic[]).map((topic) => ({
      topic: topicLabels[topic],
      accuracy: topicStats[topic].total > 0 ? Math.round((topicStats[topic].correct / topicStats[topic].total) * 100) : 0,
      attempts: topicStats[topic].total,
    }));

    const totalReviews = cardList.reduce((sum, c) => sum + c.timesCorrect + c.timesIncorrect, 0);
    const totalCorrect = cardList.reduce((sum, c) => sum + c.timesCorrect, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return { dailySeries, masteryBreakdown, difficultyBreakdown, topicAccuracy, overallAccuracy, totalReviews };
  }, [dailyStats, cards, daysBack]);
}
