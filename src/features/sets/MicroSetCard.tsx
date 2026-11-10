import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, BookOpen, HelpCircle, List } from 'lucide-react';
import type { MicroSet } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface MicroSetCardProps {
  set: MicroSet;
  onSelect: (set: MicroSet) => void;
  onQuiz?: (set: MicroSet) => void;
  onViewWords?: (set: MicroSet) => void;
}

export function MicroSetCard({ set, onSelect, onQuiz, onViewWords }: MicroSetCardProps) {
  const cards = useAppStore((s) => s.cards);

  // Calculate stats for this specific 25-word set
  const total = set.wordIds.length;
  let masteredCount = 0;
  let learningCount = 0;

  for (const id of set.wordIds) {
    const card = cards[id];
    if (card) {
      if (card.mastered) {
        masteredCount++;
      } else if (card.repetitions > 0) {
        learningCount++;
      }
    }
  }

  const progressPercent = Math.round((masteredCount / total) * 100);
  const isCompleted = masteredCount === total && total > 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className="group relative rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 p-5 shadow-xs hover:shadow-md hover:border-(--color-gold)/40 transition-all flex flex-col justify-between"
    >
      <div onClick={() => onSelect(set)} className="cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-(--color-gold) flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {total} Words
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-(--color-verdigris) bg-(--color-verdigris)/10 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Mastered
            </span>
          ) : (
            <span className="text-xs text-(--color-slate) font-mono">
              {masteredCount}/{total} mastered
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-bold text-(--color-ink) dark:text-(--color-paper) group-hover:text-(--color-gold) transition">
          {set.title}
        </h3>
        <p className="text-xs text-(--color-slate) mt-1 line-clamp-2">
          {set.subtitle}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-(--color-ink)/5 dark:border-(--color-paper)/5">
        <div className="flex items-center justify-between text-[11px] text-(--color-slate) mb-1.5 font-medium">
          <span>{learningCount} in progress</span>
          <span className="font-mono">{progressPercent}%</span>
        </div>
        <ProgressBar value={progressPercent} color="var(--color-gold)" height={5} />

        <div className="mt-3 flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            {onQuiz && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuiz(set);
                }}
                title="Take Test for this group"
                className="flex items-center gap-1 text-[11px] font-semibold text-(--color-gold) hover:bg-(--color-gold)/10 px-2.5 py-1 rounded-md border border-(--color-gold)/30 transition"
              >
                <HelpCircle className="w-3 h-3 text-(--color-gold)" />
                <span>Take Test</span>
              </button>
            )}
            {onViewWords && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewWords(set);
                }}
                title="View words in bank"
                className="flex items-center gap-1 text-[11px] font-semibold text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper) px-2 py-1 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition"
              >
                <List className="w-3 h-3" />
                <span>Words</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(set)}
            className="flex items-center text-xs font-semibold text-(--color-gold) hover:opacity-80 transition cursor-pointer"
          >
            Study Set <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

