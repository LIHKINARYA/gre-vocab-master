import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '@/core/gamification/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 4200);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {achievement && (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-(--color-gold) bg-(--color-paper) dark:bg-(--color-ink-soft) shadow-lg px-4 py-3 max-w-xs"
          >
            <span
              className="text-2xl w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-gold-soft)' }}
            >
              {achievement.icon}
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-(--color-gold) font-semibold">
                Achievement unlocked
              </p>
              <p className="font-display font-semibold text-sm text-(--color-ink) dark:text-(--color-paper)">
                {achievement.title}
              </p>
              <p className="text-xs text-(--color-slate)">{achievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
