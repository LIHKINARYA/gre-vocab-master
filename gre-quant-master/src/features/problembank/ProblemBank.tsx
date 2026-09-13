import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProblemBank, type ProblemBankFilter, type ProblemBankSort, type ProblemBankEntry } from '@/hooks/useProblemBank';
import { checkMastery } from '@/core/srs/sm2';
import { ProblemDetail } from './ProblemDetail';
import type { ProblemTopic } from '@/core/types';

const filters: { id: ProblemBankFilter; label: string }[] = [
  { id: 'attempted', label: 'Attempted' },
  { id: 'mastered', label: 'Mastered' },
  { id: 'due', label: 'Due' },
  { id: 'struggling', label: 'Struggling' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'challenge', label: '155–160 Challenge' },
  { id: 'all', label: 'All' },
];

const topics: { id: ProblemTopic | 'all'; label: string }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'arithmetic', label: 'Arithmetic' },
  { id: 'algebra', label: 'Algebra' },
  { id: 'geometry', label: 'Geometry' },
  { id: 'data-analysis', label: 'Data Analysis' },
  { id: 'word-problems', label: 'Word Problems' },
];

function statusBadge(entry: ProblemBankEntry) {
  const { card } = entry;
  if (!card) return { label: 'New', color: 'var(--color-slate)' };
  if (checkMastery(card)) return { label: 'Mastered', color: 'var(--color-verdigris)' };
  if (card.easeFactor <= 1.5 || card.timesIncorrect >= 2)
    return { label: 'Struggling', color: 'var(--color-rust)' };
  if (card.nextReview <= Date.now()) return { label: 'Due', color: 'var(--color-gold)' };
  return { label: 'Learning', color: 'var(--color-ink-soft)' };
}

export function ProblemBank() {
  const { entries, filter, setFilter, topicFilter, setTopicFilter, sort, setSort, search, setSearch, counts } =
    useProblemBank();
  const [selected, setSelected] = useState<ProblemBankEntry | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Problem Bank</p>
        <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          Every Problem
        </h1>
        <p className="text-sm text-(--color-slate) mt-1">
          {counts.attempted} attempted · {counts.mastered} mastered · {counts.due} due · {counts.struggling}{' '}
          struggling
        </p>
      </motion.header>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search problems…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm"
        />
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value as ProblemTopic | 'all')}
          className="rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm"
        >
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ProblemBankSort)}
          className="rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm"
        >
          <option value="topic">By topic</option>
          <option value="difficulty">By difficulty</option>
          <option value="recent">Recently attempted</option>
          <option value="ease-asc">Weakest first</option>
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
            <p className="text-(--color-slate) text-sm py-8 text-center">No problems match this filter.</p>
          ) : (
            entries.map((entry) => {
              const badge = statusBadge(entry);
              const isSelected = selected?.problem.id === entry.problem.id;
              return (
                <button
                  key={entry.problem.id}
                  type="button"
                  onClick={() => setSelected(entry)}
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-(--color-gold) bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10'
                      : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 hover:border-(--color-gold)/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-(--color-slate) font-semibold">
                        {entry.problem.subtopic}
                        {entry.problem.challengeSet && <span className="text-(--color-gold) ml-1">★ 155–160</span>}
                      </p>
                      <p className="text-sm line-clamp-2">{entry.problem.prompt}</p>
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
                      {entry.card.timesIncorrect}✗
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
                key={selected.problem.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <ProblemDetail problem={selected.problem} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-(--color-ink)/15 dark:border-(--color-paper)/15 p-12 text-center text-(--color-slate) text-sm"
              >
                Select a problem to see its full solution
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
