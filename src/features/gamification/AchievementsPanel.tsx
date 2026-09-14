import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { achievements } from '@/core/gamification/achievements';
import { useAppStore } from '@/store/useAppStore';

export function AchievementsPanel() {
  const achievementIds = useAppStore((s) => s.progress.achievements);
  const unlocked = useMemo(() => new Set(achievementIds), [achievementIds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5"
    >
      <div className="flex justify-between items-center mb-3">
        <p className="font-display text-lg font-semibold">Achievements</p>
        <p className="text-sm text-(--color-slate) font-mono">
          {unlocked.size} / {achievements.length}
        </p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {achievements.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div key={a.id} className="group relative flex justify-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-lg transition-opacity ${
                  isUnlocked ? '' : 'opacity-25 grayscale'
                }`}
                style={{ backgroundColor: 'var(--color-gold-soft)' }}
                title={`${a.title} — ${a.description}`}
              >
                {a.icon}
              </div>
              <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-(--color-ink) text-(--color-paper) dark:bg-(--color-paper) dark:text-(--color-ink) text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span className="font-semibold">{a.title}</span> — {a.description}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
