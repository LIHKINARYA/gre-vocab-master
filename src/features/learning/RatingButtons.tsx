import { motion } from 'framer-motion';
import type { ReviewRating } from '@/core/types';

const ratings: { key: ReviewRating; label: string; hint: string; color: string }[] = [
  { key: 'again', label: 'Again', hint: '1', color: 'var(--color-rust)' },
  { key: 'hard', label: 'Hard', hint: '2', color: 'var(--color-gold)' },
  { key: 'good', label: 'Good', hint: '3', color: 'var(--color-verdigris)' },
  { key: 'easy', label: 'Easy', hint: '4', color: 'var(--color-ink)' },
];

interface RatingButtonsProps {
  onRate: (rating: ReviewRating) => void;
}

export function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.25 }}
      className="grid grid-cols-4 gap-2 mt-6"
    >
      {ratings.map((r) => (
        <button
          key={r.key}
          onClick={() => onRate(r.key)}
          className="group flex flex-col items-center gap-1 rounded-xl py-3 border transition-all active:scale-95 hover:opacity-90"
          style={{ borderColor: r.color, color: r.color }}
        >
          <span className="font-medium text-sm">{r.label}</span>
          <span
            className="text-[10px] font-mono px-1.5 rounded border opacity-60"
            style={{ borderColor: r.color }}
          >
            {r.hint}
          </span>
        </button>
      ))}
    </motion.div>
  );
}
