import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle } from 'lucide-react';
import { getMicroSets } from '@/core/sets/microSets';
import type { MicroSet } from '@/core/types';
import { MicroSetCard } from './MicroSetCard';
import { useAppStore } from '@/store/useAppStore';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface CurriculumViewProps {
  onSelectSet: (set: MicroSet) => void;
  onQuizSet: (set: MicroSet) => void;
  onViewWords: (set: MicroSet) => void;
}

type SetFilter = 'all' | 'unstarted' | 'in-progress' | 'completed';

export function CurriculumView({ onSelectSet, onQuizSet, onViewWords }: CurriculumViewProps) {
  const cards = useAppStore((s) => s.cards);
  const sets = getMicroSets();
  const [filter, setFilter] = useState<SetFilter>('all');
  const [search, setSearch] = useState('');

  // Overall curriculum analytics with useMemo
  const { setsWithStats, totalMasteredAcrossAll, totalWordsInCurriculum, fullyCompletedSets, overallMasteryPercent } =
    useMemo(() => {
      const stats = sets.map((s) => {
        let setMastered = 0;
        let setLearning = 0;

        for (const id of s.wordIds) {
          const card = cards[id];
          if (card?.mastered) {
            setMastered++;
          } else if (card && card.repetitions > 0) {
            setLearning++;
          }
        }

        const isCompleted = setMastered === s.wordIds.length && s.wordIds.length > 0;
        const status: SetFilter = isCompleted
          ? 'completed'
          : setMastered > 0 || setLearning > 0
          ? 'in-progress'
          : 'unstarted';

        return {
          set: s,
          setMastered,
          setLearning,
          total: s.wordIds.length,
          isCompleted,
          status,
        };
      });

      const totalWords = stats.reduce((acc, curr) => acc + curr.total, 0);
      const masteredAcrossAll = stats.reduce((acc, curr) => acc + curr.setMastered, 0);
      const completedCount = stats.filter((s) => s.isCompleted).length;
      const masteryPct = totalWords > 0 ? Math.round((masteredAcrossAll / totalWords) * 100) : 0;

      return {
        setsWithStats: stats,
        totalMasteredAcrossAll: masteredAcrossAll,
        totalWordsInCurriculum: totalWords,
        fullyCompletedSets: completedCount,
        overallMasteryPercent: masteryPct,
      };
    }, [cards, sets]);



  const filteredSets = setsWithStats.filter(({ set, status }) => {
    if (filter !== 'all' && status !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return set.title.toLowerCase().includes(q) || set.subtitle.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold mb-1">
          <Layers className="w-4 h-4" />
          <span>Curriculum Track</span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          GRE 34 Groups & Curriculum
        </h1>
        <p className="text-sm text-(--color-slate) mt-1 max-w-2xl">
          Complete high-yield 34-group syllabus (30 words per group) plus supplementary sets. Study flashcards, test recall with Group Tests, and track mastery.
        </p>

        {/* Global Curriculum Progress Banner */}
        <div className="mt-6 rounded-2xl border border-(--color-gold)/30 bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-(--color-slate) font-semibold">
                Overall Curriculum Mastery
              </p>
              <p className="font-display text-2xl font-bold text-(--color-ink) dark:text-(--color-paper)">
                {totalMasteredAcrossAll} / {totalWordsInCurriculum} Words Internalized
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-(--color-verdigris)">
                <CheckCircle className="w-4 h-4" />
                {fullyCompletedSets} / {sets.length} Sets Completed
              </span>
              <span className="font-mono text-base font-bold text-(--color-gold)">
                {overallMasteryPercent}%
              </span>
            </div>
          </div>
          <ProgressBar value={overallMasteryPercent} color="var(--color-gold)" height={8} />
        </div>
      </motion.header>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: `All Sets (${sets.length})` },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'unstarted', label: 'Not Started' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                filter === id
                  ? 'border-(--color-gold) bg-(--color-gold-soft)/50 text-(--color-ink) dark:text-(--color-paper) font-semibold'
                  : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:border-(--color-gold)/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Filter micro-sets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs"
        />
      </div>

      {/* Grid of Micro-Sets */}
      {filteredSets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-ink)/15 dark:border-(--color-paper)/15 p-12 text-center text-(--color-slate) text-sm">
          No micro-sets match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.map(({ set }) => (
            <MicroSetCard
              key={set.id}
              set={set}
              onSelect={onSelectSet}
              onQuiz={onQuizSet}
              onViewWords={onViewWords}
            />
          ))}
        </div>
      )}
    </div>
  );
}
