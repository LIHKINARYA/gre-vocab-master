import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { Problem, ReviewRating } from '@/core/types';

interface SolutionPanelProps {
  problem: Problem;
  wasCorrect: boolean;
  onRateConfidence: (rating: ReviewRating) => void;
  onContinue: () => void;
}

const confidenceOptions: { rating: ReviewRating; label: string; hint: string; variant: 'secondary' | 'primary' | 'verdigris' }[] = [
  { rating: 'hard', label: 'Hard', hint: 'Got there slowly', variant: 'secondary' },
  { rating: 'good', label: 'Good', hint: 'Solid pace', variant: 'primary' },
  { rating: 'easy', label: 'Easy', hint: 'Instant', variant: 'verdigris' },
];

export function SolutionPanel({ problem, wasCorrect, onRateConfidence, onContinue }: SolutionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            wasCorrect
              ? 'bg-(--color-verdigris-soft)/50 text-(--color-verdigris)'
              : 'bg-(--color-rust-soft)/50 text-(--color-rust)'
          }`}
        >
          {wasCorrect ? 'Correct' : 'Incorrect'}
        </span>
        {problem.formula && <span className="text-xs text-(--color-slate) font-mono">{problem.formula}</span>}
      </div>

      <ol className="space-y-2 mb-6">
        {problem.solutionSteps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="shrink-0 w-5 h-5 rounded-full bg-(--color-gold-soft)/60 text-(--color-ink) flex items-center justify-center text-[11px] font-semibold">
              {i + 1}
            </span>
            <span className="text-(--color-ink) dark:text-(--color-paper) leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {wasCorrect ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-(--color-slate) font-semibold mb-2">
            How hard was that?
          </p>
          <div className="flex gap-2">
            {confidenceOptions.map((opt) => (
              <Button key={opt.rating} variant={opt.variant} onClick={() => onRateConfidence(opt.rating)}>
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <Button variant="rust" onClick={onContinue}>
          Continue →
        </Button>
      )}
    </motion.div>
  );
}
