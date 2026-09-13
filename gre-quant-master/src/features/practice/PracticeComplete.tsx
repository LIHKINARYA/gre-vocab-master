import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface PracticeCompleteProps {
  xpEarned: number;
  correct: number;
  total: number;
  onDone: () => void;
}

export function PracticeComplete({ xpEarned, correct, total, onDone }: PracticeCompleteProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[380px] rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 p-8">
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--color-verdigris-soft)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-verdigris)" strokeWidth="3">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="font-display text-2xl font-semibold text-(--color-ink) dark:text-(--color-paper)"
      >
        {total === 0 ? 'Nothing due right now' : 'Session complete'}
      </motion.h2>

      {total > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-2 text-(--color-slate)"
        >
          {total} problems solved · {accuracy}% accuracy · +{xpEarned} XP
        </motion.p>
      )}

      {total === 0 && (
        <p className="mt-2 text-(--color-slate) max-w-xs">
          You're all caught up. Come back later, or check your daily goal on the dashboard.
        </p>
      )}

      <Button className="mt-6" onClick={onDone}>
        Back to dashboard
      </Button>
    </div>
  );
}
