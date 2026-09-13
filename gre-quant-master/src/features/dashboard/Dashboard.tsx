import { motion } from 'framer-motion';
import { StatCard } from './StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { AchievementsPanel } from '@/features/gamification/AchievementsPanel';

interface DashboardProps {
  onStartPractice: () => void;
  onStartQuiz: () => void;
  onStartCram: () => void;
  onStartChallenge: () => void;
}

export function Dashboard({ onStartPractice, onStartQuiz, onStartCram, onStartChallenge }: DashboardProps) {
  const s = useDashboardStats();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">
            Field Guide to GRE Quant
          </p>
          <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
            Your Progress
          </h1>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-(--color-gold)/30 bg-(--color-gold-soft)/40 dark:bg-(--color-gold)/10 px-4 py-2">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-(--color-slate)">Level {s.level}</p>
            <p className="font-display text-lg font-semibold text-(--color-gold)">{s.xp} XP</p>
          </div>
          <div className="w-24">
            <ProgressBar value={s.levelProgress} color="var(--color-gold)" height={6} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {s.strugglingCount > 0 && (
            <Button variant="rust" onClick={onStartCram}>
              Cram {s.strugglingCount} weak problem{s.strugglingCount === 1 ? '' : 's'}
            </Button>
          )}
          <Button variant="secondary" onClick={onStartQuiz}>
            Timed Quiz
          </Button>
          <Button
            variant="secondary"
            className="border-(--color-gold)/50 text-(--color-gold)"
            onClick={onStartChallenge}
          >
            ★ 155–160 Challenge
          </Button>
          <Button onClick={onStartPractice}>Practice →</Button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-xl border border-(--color-gold)/30 bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10 p-5 mb-6"
      >
        {s.studyPlan ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-display text-lg font-semibold">
                  GRE in {s.studyPlan.daysRemaining} day{s.studyPlan.daysRemaining === 1 ? '' : 's'}
                </p>
                <p className="text-sm text-(--color-slate)">
                  {s.studyPlan.onTrack ? 'On track' : 'Behind pace'} · {s.studyPlan.paceLabel} ·{' '}
                  {s.studyPlan.reviewsDueToday} reviews due · {s.studyPlan.strugglingCount} struggling
                </p>
              </div>
              <p className="text-sm font-mono text-(--color-gold)">
                {s.problemsSolved} / {s.totalProblems} attempted
              </p>
            </div>
            <ProgressBar value={s.studyPlan.progressPercent / 100} color="var(--color-gold)" />
            <p className="text-xs text-(--color-slate) mt-2">
              {s.studyPlan.problemsRemaining > 0
                ? `Work through ~${s.studyPlan.newProblemsPerDay} new problems/day to finish the bank before your test`
                : 'All problems attempted — focus on reviews and mastering struggling ones'}
            </p>
          </>
        ) : (
          <p className="text-sm text-(--color-slate)">
            Set your GRE test date in Settings to get a personalized study pace.
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard index={0} label="Total Problems" value={s.totalProblems} accent="var(--color-ink)" />
        <StatCard index={1} label="Solved" value={s.problemsSolved} accent="var(--color-verdigris)" />
        <StatCard index={2} label="Due Today" value={s.dueToday} accent="var(--color-rust)" />
        <StatCard index={3} label="New Remaining" value={s.newProblemsRemaining} accent="var(--color-ink)" />
        <StatCard index={4} label="Accuracy" value={s.accuracy} suffix="%" accent="var(--color-verdigris)" />
        <StatCard index={5} label="Current Streak" value={s.currentStreak} suffix="days" accent="var(--color-gold)" />
        <StatCard index={6} label="Longest Streak" value={s.longestStreak} suffix="days" accent="var(--color-gold)" />
        <StatCard index={7} label="Mastered" value={s.problemsMastered} accent="var(--color-verdigris)" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5"
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-display text-lg font-semibold">Today's Goal</p>
          <p className="text-sm text-(--color-slate)">
            {s.todayNewProblems} / {s.dailyGoal} new problems
          </p>
        </div>
        <ProgressBar
          value={s.dailyGoal > 0 ? s.todayNewProblems / s.dailyGoal : 0}
          color="var(--color-verdigris)"
        />
      </motion.div>

      <div className="mt-6">
        <AchievementsPanel />
      </div>
    </div>
  );
}
