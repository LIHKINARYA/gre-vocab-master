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

const topicLabels: Record<string, string> = {
  'text-completion': 'Text Completion',
  'sentence-equivalence': 'Sentence Equivalence',
  'reading-comprehension': 'Reading Comprehension',
};

export function QuizComplete({ correctCount, total, missed, onRetakeMissed, onNewQuiz, onExit }: QuizCompleteProps) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const tone = accuracy >= 80 ? 'var(--color-verdigris)' : accuracy >= 50 ? 'var(--color-gold)' : 'var(--color-rust)';

  const byTopic = missed.reduce<Record<string, number>>((acc, m) => {
    acc[m.item.topic] = (acc[m.item.topic] ?? 0) + 1;
    return acc;
  }, {});

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

      {Object.keys(byTopic).length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold mb-2">Missed by type</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byTopic).map(([topic, count]) => (
              <span
                key={topic}
                className="text-xs px-3 py-1.5 rounded-full border border-(--color-rust)/30 bg-(--color-rust-soft)/15 text-(--color-rust)"
              >
                {topicLabels[topic] ?? topic} · {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {missed.length > 0 && (
          <Button variant="rust" onClick={onRetakeMissed}>
            Retake missed items
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
