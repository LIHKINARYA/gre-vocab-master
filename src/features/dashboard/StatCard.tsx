import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  suffix?: string;
  accent?: string; // CSS var
  index?: number;
}

export function StatCard({ label, value, suffix, accent = 'var(--color-ink)', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      className="relative rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-4 overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 h-full w-1"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <p className="text-[11px] uppercase tracking-wider text-(--color-slate) font-medium pl-2">
        {label}
      </p>
      <p className="mt-1 pl-2 font-display text-2xl font-semibold" style={{ color: accent }}>
        {value}
        {suffix && <span className="text-sm font-body font-normal text-(--color-slate) ml-1">{suffix}</span>}
      </p>
    </motion.div>
  );
}
