import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { MissedItem } from './useQuizSession';

interface QuizCompleteProps {
  correctCount: number;
  total: number;
  missed: MissedItem[];
  onRetakeMissed: () => void;
  onNewQuiz: () => void;
  onExit: () => void;
}

export function QuizComplete({ correctCount, total, missed, onRetakeMissed, onNewQuiz, onExit }: QuizCompleteProps) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const tone = accuracy >= 80 ? 'var(--color-verdigris)' : accuracy >= 50 ? 'var(--color-gold)' : 'var(--color-rust)';

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 p-8 text-center mb-6"
      >
        <p className="text-xs uppercase tracking-wider text-(--color-slate) font-semibold mb-2">Quiz complete</p>
        <p className="font-display text-5xl font-semibold" style={{ color: tone }}>
          {accuracy}%
        </p>
        <p className="text-sm text-(--color-slate) mt-2">
          {correctCount} / {total} correct
        </p>
      </motion.div>

      {missed.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold mb-2">Missed this round</p>
          <div className="space-y-2">
            {missed.map((m) => (
              <div
                key={m.question.id}
                className="rounded-lg border border-(--color-rust)/30 bg-(--color-rust-soft)/15 p-3 text-sm"
              >
                <p className="font-display font-semibold">{m.word.word}</p>
                <p className="text-(--color-slate) text-xs mt-0.5">{m.word.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {missed.length > 0 && (
          <Button variant="rust" onClick={onRetakeMissed}>
            Retake missed words
          </Button>
        )}
        <Button variant="secondary" onClick={onNewQuiz}>
          New quiz
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
