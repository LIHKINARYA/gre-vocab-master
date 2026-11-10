import { useState, useMemo } from 'react';
import { useAppStore, words } from '@/store/useAppStore';
import type { CardState, ReviewRating, Word } from '@/core/types';

export type RecapScope = 'session' | 'today';
export type RecapFilter = 'all' | 'needs-work' | 'hard' | 'good' | 'easy' | 'mastered' | 'bookmarked';
export type RecapSort = 'recent' | 'first' | 'alpha' | 'difficulty' | 'speed';

export interface WordReviewSummary {
  word: Word;
  card: CardState | undefined;
  lastRating: ReviewRating;
  lastReviewedAt: number;
  timesReviewedInScope: number;
  avgResponseTimeMs: number;
  hadFailureInScope: boolean;
  isNewCard: boolean;
}

export function isSameCalendarDay(timestamp: number, compareTimestamp = Date.now()): boolean {
  const d1 = new Date(timestamp);
  const d2 = new Date(compareTimestamp);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function useSessionRecap(initialScope: RecapScope = 'session') {
  const [scope, setScope] = useState<RecapScope>(initialScope);
  const [filter, setFilter] = useState<RecapFilter>('all');
  const [sort, setSort] = useState<RecapSort>('recent');
  const [search, setSearch] = useState('');
  const [mountedAt] = useState(() => Date.now());

  const cards = useAppStore((s) => s.cards);
  const sessionReviews = useAppStore((s) => s.sessionReviews);
  const sessionStartedAt = useAppStore((s) => s.sessionStartedAt);
  const resetSession = useAppStore((s) => s.resetSession);

  // 1. Compute distinct summaries for Current Session
  const sessionSummaries = useMemo<WordReviewSummary[]>(() => {
    if (sessionReviews.length === 0) return [];

    const map = new Map<string, {
      wordId: string;
      ratings: ReviewRating[];
      responseTimes: number[];
      timestamps: number[];
      isNewCard: boolean;
    }>();

    for (const item of sessionReviews) {
      const existing = map.get(item.wordId);
      if (!existing) {
        map.set(item.wordId, {
          wordId: item.wordId,
          ratings: [item.rating],
          responseTimes: [item.responseTimeMs],
          timestamps: [item.timestamp],
          isNewCard: item.isNewCard,
        });
      } else {
        existing.ratings.push(item.rating);
        existing.responseTimes.push(item.responseTimeMs);
        existing.timestamps.push(item.timestamp);
      }
    }

    const results: WordReviewSummary[] = [];
    for (const [wordId, data] of map.entries()) {
      const word = words.find((w) => w.id === wordId);
      if (!word) continue;

      const card = cards[wordId];
      const lastRating = data.ratings[data.ratings.length - 1];
      const lastReviewedAt = data.timestamps[data.timestamps.length - 1];
      const avgResponseTimeMs = Math.round(
        data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length,
      );
      const hadFailureInScope = data.ratings.includes('again');

      results.push({
        word,
        card,
        lastRating,
        lastReviewedAt,
        timesReviewedInScope: data.ratings.length,
        avgResponseTimeMs,
        hadFailureInScope,
        isNewCard: data.isNewCard,
      });
    }

    return results;
  }, [sessionReviews, cards]);

  // 2. Compute distinct summaries for Today
  const todaySummaries = useMemo<WordReviewSummary[]>(() => {
    const now = mountedAt;
    const results: WordReviewSummary[] = [];

    for (const word of words) {
      const card = cards[word.id];
      if (!card) continue;

      // Check card history for today
      const eventsToday = card.history?.filter((h) => isSameCalendarDay(h.timestamp, now)) ?? [];

      // Or if lastReviewed is today even if history was trimmed
      const lastReviewedToday = card.lastReviewed && isSameCalendarDay(card.lastReviewed, now);

      if (eventsToday.length === 0 && !lastReviewedToday) {
        continue;
      }

      const ratings = eventsToday.map((e) => e.rating);
      const responseTimes = eventsToday.map((e) => e.responseTimeMs);
      const lastRating: ReviewRating = ratings.length > 0
        ? ratings[ratings.length - 1]
        : (card.timesIncorrect > 0 && card.repetitions === 0 ? 'again' : 'good');

      const lastReviewedAt = eventsToday.length > 0
        ? eventsToday[eventsToday.length - 1].timestamp
        : (card.lastReviewed ?? now);

      const avgResponseTimeMs = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 2200;

      const hadFailureInScope = ratings.includes('again');
      const isNewCard = (card.history?.length ?? 0) <= 1;

      results.push({
        word,
        card,
        lastRating,
        lastReviewedAt,
        timesReviewedInScope: Math.max(1, eventsToday.length),
        avgResponseTimeMs,
        hadFailureInScope,
        isNewCard,
      });
    }

    return results;
  }, [cards, mountedAt]);

  // 3. Active pool based on selected scope
  const activePool = scope === 'session' ? sessionSummaries : todaySummaries;

  // 4. Overall stats for active scope
  const stats = useMemo(() => {
    const totalWords = activePool.length;
    let totalReviews = 0;
    let successfulReviews = 0;
    let newWordsCount = 0;
    let needsWorkCount = 0;
    let masteredCount = 0;
    let totalTime = 0;

    for (const item of activePool) {
      totalReviews += item.timesReviewedInScope;
      if (!item.hadFailureInScope) successfulReviews++;
      if (item.isNewCard) newWordsCount++;
      if (item.lastRating === 'again' || item.hadFailureInScope) needsWorkCount++;
      if (item.card?.mastered) masteredCount++;
      totalTime += item.avgResponseTimeMs;
    }

    const accuracy = totalWords > 0 ? Math.round((successfulReviews / totalWords) * 100) : 0;
    const avgResponseTime = totalWords > 0 ? (totalTime / totalWords / 1000).toFixed(1) : '0.0';

    return {
      totalWords,
      totalReviews,
      accuracy,
      newWordsCount,
      needsWorkCount,
      masteredCount,
      avgResponseTime,
    };
  }, [activePool]);

  // 5. Filter and search
  const filteredSummaries = useMemo(() => {
    let list = activePool;

    // Filter
    if (filter === 'needs-work') {
      list = list.filter((i) => i.lastRating === 'again' || i.hadFailureInScope);
    } else if (filter === 'hard') {
      list = list.filter((i) => i.lastRating === 'hard');
    } else if (filter === 'good') {
      list = list.filter((i) => i.lastRating === 'good');
    } else if (filter === 'easy') {
      list = list.filter((i) => i.lastRating === 'easy');
    } else if (filter === 'mastered') {
      list = list.filter((i) => i.card?.mastered);
    } else if (filter === 'bookmarked') {
      list = list.filter((i) => i.card?.bookmarked || i.card?.favorite);
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.word.word.toLowerCase().includes(q) ||
          i.word.meaning.toLowerCase().includes(q) ||
          i.word.mnemonic.toLowerCase().includes(q) ||
          i.word.synonyms.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Sort
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'recent':
          return b.lastReviewedAt - a.lastReviewedAt;
        case 'first':
          return a.lastReviewedAt - b.lastReviewedAt;
        case 'alpha':
          return a.word.word.localeCompare(b.word.word);
        case 'difficulty': {
          const rank = { hard: 3, medium: 2, easy: 1 };
          return rank[b.word.difficulty] - rank[a.word.difficulty];
        }
        case 'speed':
          return b.avgResponseTimeMs - a.avgResponseTimeMs;
        default:
          return 0;
      }
    });

    return sorted;
  }, [activePool, filter, search, sort]);

  return {
    scope,
    setScope,
    filter,
    setFilter,
    sort,
    setSort,
    search,
    setSearch,
    sessionSummaries,
    todaySummaries,
    activePool,
    filteredSummaries,
    stats,
    sessionStartedAt,
    resetSession,
  };
}
