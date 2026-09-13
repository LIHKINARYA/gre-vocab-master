import { useMemo, useState } from 'react';
import { useAppStore, items } from '@/store/useAppStore';
import { checkMastery, isStruggling } from '@/core/srs/sm2';
import type { CardState, VerbalItem, VerbalTopic } from '@/core/types';

export type ItemBankFilter = 'all' | 'attempted' | 'mastered' | 'due' | 'struggling' | 'not-started';
export type ItemBankSort = 'topic' | 'difficulty' | 'recent' | 'ease-asc';

export interface ItemBankEntry {
  item: VerbalItem;
  card: CardState | undefined;
}

const difficultyRank: Record<VerbalItem['difficulty'], number> = { easy: 0, medium: 1, hard: 2 };

function itemSearchText(item: VerbalItem): string {
  if (item.type === 'text-completion') return item.passageText;
  if (item.type === 'sentence-equivalence') return item.sentenceText;
  return item.prompt;
}

function matchesFilter(entry: ItemBankEntry, filter: ItemBankFilter, now: number): boolean {
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
    default:
      return true;
  }
}

function sortEntries(entries: ItemBankEntry[], sort: ItemBankSort): ItemBankEntry[] {
  const sorted = [...entries];
  switch (sort) {
    case 'topic':
      return sorted.sort((a, b) => a.item.topic.localeCompare(b.item.topic) || a.item.id.localeCompare(b.item.id));
    case 'difficulty':
      return sorted.sort((a, b) => difficultyRank[a.item.difficulty] - difficultyRank[b.item.difficulty]);
    case 'recent':
      return sorted.sort((a, b) => (b.card?.lastReviewed ?? 0) - (a.card?.lastReviewed ?? 0));
    case 'ease-asc':
      return sorted.sort((a, b) => (a.card?.easeFactor ?? 99) - (b.card?.easeFactor ?? 99));
    default:
      return sorted;
  }
}

export function useItemBank() {
  const cards = useAppStore((s) => s.cards);
  const [filter, setFilter] = useState<ItemBankFilter>('all');
  const [topicFilter, setTopicFilter] = useState<VerbalTopic | 'all'>('all');
  const [sort, setSort] = useState<ItemBankSort>('topic');
  const [search, setSearch] = useState('');

  const entries = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();

    const all: ItemBankEntry[] = items.map((item) => ({ item, card: cards[item.id] }));

    const filtered = all.filter((entry) => {
      if (topicFilter !== 'all' && entry.item.topic !== topicFilter) return false;
      if (!matchesFilter(entry, filter, now)) return false;
      if (!q) return true;
      return itemSearchText(entry.item).toLowerCase().includes(q) || entry.item.subtopic.toLowerCase().includes(q);
    });

    return sortEntries(filtered, sort);
  }, [cards, filter, topicFilter, sort, search]);

  const counts = useMemo(() => {
    const now = Date.now();
    const all = items.map((item) => ({ item, card: cards[item.id] }));
    return {
      all: all.length,
      attempted: all.filter((e) => e.card).length,
      mastered: all.filter((e) => e.card && checkMastery(e.card)).length,
      due: all.filter((e) => e.card && e.card.nextReview <= now).length,
      struggling: all.filter((e) => e.card && isStruggling(e.card)).length,
      notStarted: all.filter((e) => !e.card).length,
    };
  }, [cards]);

  return { entries, filter, setFilter, topicFilter, setTopicFilter, sort, setSort, search, setSearch, counts };
}
