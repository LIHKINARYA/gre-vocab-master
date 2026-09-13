import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ItemPrompt } from '@/features/practice/ItemPrompt';
import type { VerbalItem } from '@/core/types';
import type { ItemAnswer } from '@/core/grading';

interface QuizItemViewProps {
  item: VerbalItem;
  phase: 'attempt' | 'graded';
  answer: ItemAnswer;
  onSelectTCBlank: (blankId: string, choiceId: string) => void;
  onToggleSEChoice: (choiceId: string) => void;
  onToggleRCChoice: (choiceId: string) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  wasCorrect: boolean | null;
  onNext: () => void;
  isLast: boolean;
}

export function QuizItemView({
  item,
  phase,
  answer,
  onSelectTCBlank,
  onToggleSEChoice,
  onToggleRCChoice,
  canSubmit,
  onSubmit,
  wasCorrect,
  onNext,
  isLast,
}: QuizItemViewProps) {
  return (
    <div>
      <ItemPrompt
        item={item}
        answer={answer}
        disabled={phase === 'graded'}
        onSelectTCBlank={onSelectTCBlank}
        onToggleSEChoice={onToggleSEChoice}
        onToggleRCChoice={onToggleRCChoice}
      />

      {phase === 'attempt' && (
        <div className="flex justify-end mt-4">
          <Button onClick={onSubmit} disabled={!canSubmit}>
            Submit
          </Button>
        </div>
      )}

      <AnimatePresence>
        {phase === 'graded' && wasCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 p-6"
          >
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                wasCorrect
                  ? 'bg-(--color-verdigris-soft)/50 text-(--color-verdigris)'
                  : 'bg-(--color-rust-soft)/50 text-(--color-rust)'
              }`}
            >
              {wasCorrect ? 'Correct' : 'Incorrect'}
            </span>
            <ol className="space-y-1.5 mt-3 mb-4">
              {item.solutionSteps.map((step, i) => (
                <li key={i} className="text-xs text-(--color-ink) dark:text-(--color-paper) leading-relaxed">
                  {i + 1}. {step}
                </li>
              ))}
            </ol>
            <Button onClick={onNext}>{isLast ? 'See results →' : 'Next →'}</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
