import { useMemo, useState } from 'react';
import { useAppStore, problems } from '@/store/useAppStore';
import { checkMastery } from '@/core/srs/sm2';
import type { CardState, Problem, ProblemTopic } from '@/core/types';

export type ProblemBankFilter = 'all' | 'attempted' | 'mastered' | 'due' | 'struggling' | 'not-started' | 'challenge';
export type ProblemBankSort = 'topic' | 'difficulty' | 'recent' | 'ease-asc';

export interface ProblemBankEntry {
  problem: Problem;
  card: CardState | undefined;
}

const difficultyRank: Record<Problem['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

function isStruggling(card: CardState): boolean {
  return card.easeFactor <= 1.5 || card.timesIncorrect >= 2;
}

function matchesFilter(entry: ProblemBankEntry, filter: ProblemBankFilter, now: number): boolean {
  const { card } = entry;
  switch (filter) {
    case 'all':
      return true;
    case 'attempted':
      return !!card;
    case 'mastered':
      return !!card && checkMastery(card);
    case 'due':
      return !!card && card.nextReview <= now;
    case 'struggling':
      return !!card && isStruggling(card);
    case 'not-started':
      return !card;
    case 'challenge':
      return !!entry.problem.challengeSet;
    default:
      return true;
  }
}

function sortEntries(entries: ProblemBankEntry[], sort: ProblemBankSort): ProblemBankEntry[] {
  const sorted = [...entries];
  switch (sort) {
    case 'topic':
      return sorted.sort((a, b) => a.problem.topic.localeCompare(b.problem.topic) || a.problem.id.localeCompare(b.problem.id));
    case 'difficulty':
      return sorted.sort((a, b) => difficultyRank[a.problem.difficulty] - difficultyRank[b.problem.difficulty]);
    case 'recent':
      return sorted.sort((a, b) => (b.card?.lastReviewed ?? 0) - (a.card?.lastReviewed ?? 0));
    case 'ease-asc':
      return sorted.sort((a, b) => (a.card?.easeFactor ?? 99) - (b.card?.easeFactor ?? 99));
    default:
      return sorted;
  }
}

export function useProblemBank() {
  const cards = useAppStore((s) => s.cards);
  const [filter, setFilter] = useState<ProblemBankFilter>('all');
  const [topicFilter, setTopicFilter] = useState<ProblemTopic | 'all'>('all');
  const [sort, setSort] = useState<ProblemBankSort>('topic');
  const [search, setSearch] = useState('');

  const entries = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();

    const all: ProblemBankEntry[] = problems.map((problem) => ({
      problem,
      card: cards[problem.id],
    }));

    const filtered = all.filter((entry) => {
      if (topicFilter !== 'all' && entry.problem.topic !== topicFilter) return false;
      if (!matchesFilter(entry, filter, now)) return false;
      if (!q) return true;
      return (
        entry.problem.prompt.toLowerCase().includes(q) ||
        entry.problem.subtopic.toLowerCase().includes(q)
      );
    });

    return sortEntries(filtered, sort);
  }, [cards, filter, topicFilter, sort, search]);

  const counts = useMemo(() => {
    const now = Date.now();
    const all = problems.map((problem) => ({ problem, card: cards[problem.id] }));
    return {
      all: all.length,
      attempted: all.filter((e) => e.card).length,
      mastered: all.filter((e) => e.card && checkMastery(e.card)).length,
      due: all.filter((e) => e.card && e.card.nextReview <= now).length,
      struggling: all.filter((e) => e.card && isStruggling(e.card)).length,
      notStarted: all.filter((e) => !e.card).length,
      challenge: all.filter((e) => e.problem.challengeSet).length,
    };
  }, [cards]);

  return { entries, filter, setFilter, topicFilter, setTopicFilter, sort, setSort, search, setSearch, counts };
}
