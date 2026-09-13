import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordBank, type WordBankFilter, type WordBankSort } from '@/hooks/useWordBank';
import { checkMastery, isLearned } from '@/core/srs/sm2';
import type { WordBankEntry } from '@/hooks/useWordBank';
import { WordCard } from '@/features/learning/WordCard';

const filters: { id: WordBankFilter; label: string }[] = [
  { id: 'learned', label: 'Learned' },
  { id: 'mastered', label: 'Mastered' },
  { id: 'due', label: 'Due' },
  { id: 'struggling', label: 'Struggling' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'all', label: 'All' },
];

function statusBadge(entry: WordBankEntry) {
  const { card } = entry;
  if (!card) return { label: 'New', color: 'var(--color-slate)' };
  if (checkMastery(card)) return { label: 'Mastered', color: 'var(--color-verdigris)' };
  if (card.easeFactor <= 1.5 || card.timesIncorrect >= 2)
    return { label: 'Struggling', color: 'var(--color-rust)' };
  if (card.nextReview <= Date.now()) return { label: 'Due', color: 'var(--color-gold)' };
  if (isLearned(card)) return { label: 'Learned', color: 'var(--color-verdigris-soft)' };
  return { label: 'Learning', color: 'var(--color-ink-soft)' };
}

function formatNextReview(ts: number): string {
  const diff = ts - Date.now();
  if (diff <= 0) return 'Due now';
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days}d`;
  return `${Math.round(days / 7)}w`;
}

export function WordBank() {
  const { entries, filter, setFilter, sort, setSort, search, setSearch, counts } = useWordBank();
  const [selected, setSelected] = useState<WordBankEntry | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Word Bank</p>
        <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          Your Vocabulary
        </h1>
        <p className="text-sm text-(--color-slate) mt-1">
          {counts.learned} learned · {counts.mastered} mastered · {counts.due} due · {counts.struggling}{' '}
          struggling
        </p>
      </motion.header>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search words, meanings, synonyms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as WordBankSort)}
          className="rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm"
        >
          <option value="alpha">A → Z</option>
          <option value="recent">Recently reviewed</option>
          <option value="ease-asc">Weakest first</option>
          <option value="frequency">GRE frequency</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === id
                ? 'border-(--color-gold) bg-(--color-gold-soft)/50 text-(--color-ink) dark:text-(--color-paper)'
                : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:border-(--color-gold)/40'
            }`}
          >
            {label} ({counts[id === 'not-started' ? 'notStarted' : id]})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <p className="text-(--color-slate) text-sm py-8 text-center">No words match this filter.</p>
          ) : (
            entries.map((entry) => {
              const badge = statusBadge(entry);
              const isSelected = selected?.word.id === entry.word.id;
              return (
                <button
                  key={entry.word.id}
                  type="button"
                  onClick={() => setSelected(entry)}
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-(--color-gold) bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10'
                      : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 hover:border-(--color-gold)/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold">{entry.word.word}</p>
                      <p className="text-sm text-(--color-slate) line-clamp-1">{entry.word.meaning}</p>
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        color: badge.color,
                        backgroundColor: `color-mix(in srgb, ${badge.color} 12%, transparent)`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {entry.card && (
                    <p className="text-xs text-(--color-slate) mt-2 font-mono">
                      Ease {entry.card.easeFactor.toFixed(1)} · {entry.card.timesCorrect}✓{' '}
                      {entry.card.timesIncorrect}✗ · {formatNextReview(entry.card.nextReview)}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.word.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <WordCard word={selected.word} revealed />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-(--color-ink)/15 dark:border-(--color-paper)/15 p-12 text-center text-(--color-slate) text-sm"
              >
                Select a word to see its full details
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
