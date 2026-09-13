import { useMemo } from 'react';
import { useAppStore, items } from '@/store/useAppStore';
import { checkMastery, isStruggling } from '@/core/srs/sm2';
import type { VerbalTopic } from '@/core/types';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const topicLabels: Record<VerbalTopic, string> = {
  'text-completion': 'Text Completion',
  'sentence-equivalence': 'Sentence Equivalence',
  'reading-comprehension': 'Reading Comprehension',
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
        date: date.slice(5),
        reviews,
        newItems: stat?.newItemsSolved ?? 0,
        accuracy,
      };
    });

    const cardList = Object.values(cards);
    const mastered = cardList.filter(checkMastery).length;
    const struggling = cardList.filter((c) => isStruggling(c) && !checkMastery(c)).length;
    const learning = cardList.length - mastered - struggling;
    const notStarted = items.length - cardList.length;

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
    for (const it of items) {
      difficultyCounts[it.difficulty].total += 1;
      if (cards[it.id]) difficultyCounts[it.difficulty].attempted += 1;
    }
    const difficultyBreakdown = Object.entries(difficultyCounts).map(([difficulty, v]) => ({
      difficulty,
      total: v.total,
      attempted: v.attempted,
    }));

    const topicStats: Record<string, { correct: number; total: number }> = {};
    for (const topic of Object.keys(topicLabels) as VerbalTopic[]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    for (const it of items) {
      const card = cards[it.id];
      if (!card) continue;
      topicStats[it.topic].correct += card.timesCorrect;
      topicStats[it.topic].total += card.timesCorrect + card.timesIncorrect;
    }
    const topicAccuracy = (Object.keys(topicLabels) as VerbalTopic[]).map((topic) => ({
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
