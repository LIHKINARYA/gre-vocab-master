import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ProblemPrompt } from '@/features/practice/ProblemPrompt';
import type { Problem } from '@/core/types';

type Comparison = 'A' | 'B' | 'equal' | 'cannot-determine';

interface QuizQuestionViewProps {
  problem: Problem;
  phase: 'attempt' | 'graded';
  selectedChoiceId: string | null;
  setSelectedChoiceId: (id: string) => void;
  selectedComparison: Comparison | null;
  setSelectedComparison: (c: Comparison) => void;
  numericInput: string;
  setNumericInput: (v: string) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  wasCorrect: boolean | null;
  onNext: () => void;
  isLast: boolean;
}

export function QuizQuestionView({
  problem,
  phase,
  selectedChoiceId,
  setSelectedChoiceId,
  selectedComparison,
  setSelectedComparison,
  numericInput,
  setNumericInput,
  canSubmit,
  onSubmit,
  wasCorrect,
  onNext,
  isLast,
}: QuizQuestionViewProps) {
  return (
    <div>
      <ProblemPrompt
        problem={problem}
        selectedChoiceId={selectedChoiceId}
        setSelectedChoiceId={setSelectedChoiceId}
        selectedComparison={selectedComparison}
        setSelectedComparison={setSelectedComparison}
        numericInput={numericInput}
        setNumericInput={setNumericInput}
        disabled={phase === 'graded'}
        wasCorrect={wasCorrect}
        correctChoiceId={problem.correctChoiceId}
        correctComparison={problem.correctComparison}
        onSubmitViaEnter={canSubmit ? onSubmit : undefined}
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
              {problem.solutionSteps.map((step, i) => (
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
