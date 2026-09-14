import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-1
  color?: string; // CSS var reference, e.g. 'var(--color-gold)'
  label?: string;
  height?: number;
}

export function ProgressBar({ value, color = 'var(--color-gold)', label, height = 8 }: ProgressBarProps) {
  const pct = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-(--color-slate) mb-1 font-medium">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full bg-(--color-ink)/10 dark:bg-(--color-paper)/10 overflow-hidden"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
