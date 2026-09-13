import { useMemo, useState } from 'react';
import { useAppStore, words } from '@/store/useAppStore';
import { checkMastery, isLearned, isStruggling } from '@/core/srs/sm2';
import type { CardState, Word } from '@/core/types';

export type WordBankFilter = 'all' | 'learned' | 'mastered' | 'due' | 'struggling' | 'not-started';
export type WordBankSort = 'alpha' | 'recent' | 'ease-asc' | 'frequency';

export interface WordBankEntry {
  word: Word;
  card: CardState | undefined;
}

function matchesFilter(entry: WordBankEntry, filter: WordBankFilter, now: number): boolean {
  const { card } = entry;
  switch (filter) {
    case 'all':
      return true;
    case 'learned':
      return !!card && isLearned(card);
    case 'mastered':
      return !!card && checkMastery(card);
    case 'due':
      return !!card && card.nextReview <= now;
    case 'struggling':
      return !!card && isStruggling(card);
    case 'not-started':
      return !card;
    default:
      return true;
  }
}

function sortEntries(entries: WordBankEntry[], sort: WordBankSort): WordBankEntry[] {
  const sorted = [...entries];
  switch (sort) {
    case 'alpha':
      return sorted.sort((a, b) => a.word.word.localeCompare(b.word.word));
    case 'recent':
      return sorted.sort((a, b) => (b.card?.lastReviewed ?? 0) - (a.card?.lastReviewed ?? 0));
    case 'ease-asc':
      return sorted.sort((a, b) => (a.card?.easeFactor ?? 99) - (b.card?.easeFactor ?? 99));
    case 'frequency':
      return sorted.sort((a, b) => b.word.greFrequency - a.word.greFrequency);
    default:
      return sorted;
  }
}

export function useWordBank() {
  const cards = useAppStore((s) => s.cards);
  const [filter, setFilter] = useState<WordBankFilter>('learned');
  const [sort, setSort] = useState<WordBankSort>('alpha');
  const [search, setSearch] = useState('');

  const entries = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();

    const all: WordBankEntry[] = words.map((word) => ({
      word,
      card: cards[word.id],
    }));

    const filtered = all.filter((entry) => {
      if (!matchesFilter(entry, filter, now)) return false;
      if (!q) return true;
      return (
        entry.word.word.toLowerCase().includes(q) ||
        entry.word.meaning.toLowerCase().includes(q) ||
        entry.word.synonyms.some((s) => s.toLowerCase().includes(q))
      );
    });

    return sortEntries(filtered, sort);
  }, [cards, filter, sort, search]);

  const counts = useMemo(() => {
    const now = Date.now();
    const all = words.map((word) => ({ word, card: cards[word.id] }));
    return {
      all: all.length,
      learned: all.filter((e) => e.card && isLearned(e.card)).length,
      mastered: all.filter((e) => e.card && checkMastery(e.card)).length,
      due: all.filter((e) => e.card && e.card.nextReview <= now).length,
      struggling: all.filter((e) => e.card && isStruggling(e.card)).length,
      notStarted: all.filter((e) => !e.card).length,
    };
  }, [cards]);

  return { entries, filter, setFilter, sort, setSort, search, setSearch, counts };
}
