import { Layers } from 'lucide-react';
import { MicroSetCard } from './MicroSetCard';
import { getMicroSets } from '@/core/sets/microSets';
import type { MicroSet } from '@/core/types';

interface MicroSetExplorerProps {
  onSelectSet: (set: MicroSet) => void;
  onQuizSet?: (set: MicroSet) => void;
  onViewWords?: (set: MicroSet) => void;
  isStandalonePage?: boolean;
}

export function MicroSetExplorer({
  onSelectSet,
  onQuizSet,
  onViewWords,
  isStandalonePage = false,
}: MicroSetExplorerProps) {
  const sets = getMicroSets();

  return (
    <section className={isStandalonePage ? 'max-w-5xl mx-auto px-4 py-8' : 'mb-10'}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-(--color-gold) font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Curriculum</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-(--color-ink) dark:text-(--color-paper)">
            GRE Vocabulary Groups (1–34)
          </h2>
          <p className="text-xs sm:text-sm text-(--color-slate) mt-1 max-w-2xl">
            Complete syllabus of 34 high-yield groups (30 words per group) plus supplementary sets. Study flashcards, launch Take Test quizzes, or inspect words in the bank.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sets.map((microSet) => (
          <MicroSetCard
            key={microSet.id}
            set={microSet}
            onSelect={onSelectSet}
            onQuiz={onQuizSet}
            onViewWords={onViewWords}
          />
        ))}
      </div>
    </section>
  );
}

