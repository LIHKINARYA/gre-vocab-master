import { useAppStore } from '@/store/useAppStore';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/Button';

export function Settings() {
  const progress = useAppStore((s) => s.progress);
  const setTestDate = useAppStore((s) => s.setTestDate);
  const setDailyGoal = useAppStore((s) => s.setDailyGoal);
  const syncDailyGoalFromPlan = useAppStore((s) => s.syncDailyGoalFromPlan);
  const setTheme = useAppStore((s) => s.setTheme);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const s = useDashboardStats();

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Settings</p>
        <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          Study Preferences
        </h1>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <label className="block text-sm font-semibold mb-2">GRE Test Date</label>
          <input
            type="date"
            value={progress.testDate ?? ''}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
          />
          {s.studyPlan && (
            <p className="text-xs text-(--color-slate) mt-2">
              {s.studyPlan.daysRemaining} days left · recommended pace: {s.studyPlan.recommendedDailyGoal} new
              items/day ({s.studyPlan.paceLabel})
            </p>
          )}
        </section>

        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <label className="block text-sm font-semibold mb-2">Daily New Items Goal</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={85}
              value={progress.dailyGoal}
              onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="flex-1 rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
            />
            <Button variant="secondary" onClick={syncDailyGoalFromPlan}>
              Auto
            </Button>
          </div>
          {s.studyPlan && progress.dailyGoal !== s.studyPlan.recommendedDailyGoal && (
            <p className="text-xs text-(--color-gold) mt-2">
              Plan suggests {s.studyPlan.recommendedDailyGoal}/day to finish on time
            </p>
          )}
        </section>

        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <label className="block text-sm font-semibold mb-2">Theme</label>
          <div className="flex gap-2">
            <Button variant={progress.theme === 'light' ? 'primary' : 'secondary'} onClick={() => setTheme('light')}>
              Light
            </Button>
            <Button variant={progress.theme === 'dark' ? 'primary' : 'secondary'} onClick={() => setTheme('dark')}>
              Dark
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-(--color-rust)/30 bg-(--color-rust-soft)/20 p-5">
          <p className="text-sm font-semibold text-(--color-rust) mb-2">Reset Progress</p>
          <p className="text-xs text-(--color-slate) mb-3">
            Clears all card history, stats, and XP. The item bank itself is not affected.
          </p>
          <Button
            variant="rust"
            onClick={() => {
              if (window.confirm('Reset all learning progress? This cannot be undone.')) {
                resetProgress();
              }
            }}
          >
            Reset All Progress
          </Button>
        </section>
      </div>
    </div>
  );
}
