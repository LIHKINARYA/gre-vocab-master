import { motion } from 'framer-motion';
import { StatCard } from './StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSessionRecap } from '@/hooks/useSessionRecap';
import { AchievementsPanel } from '@/features/gamification/AchievementsPanel';
import { RegisterCallout } from '@/features/auth/RegisterCallout';
import { Zap, ArrowRight, Layers } from 'lucide-react';
import type { MicroSet } from '@/core/types';
import type { User } from 'firebase/auth';

interface DashboardProps {
  onStartLearning: () => void;
  onStartCram: () => void;
  onSelectMicroSet?: (set: MicroSet) => void;
  onQuizMicroSet?: (set: MicroSet) => void;
  onViewMicroSetWords?: (set: MicroSet) => void;
  onViewAllSets?: () => void;
  onOpenRecap?: () => void;
  user: User | null;
  onOpenAuth: () => void;
}

export function Dashboard({
  onStartLearning,
  onStartCram,
  onViewAllSets,
  onOpenRecap,
  user,
  onOpenAuth,
}: DashboardProps) {
  const s = useDashboardStats();
  const { sessionSummaries, todaySummaries, stats: recapStats } = useSessionRecap('session');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {!user && (
        <RegisterCallout
          onOpenAuth={onOpenAuth}
          streak={s.currentStreak}
          wordCount={s.wordsLearned}
        />
      )}

      {/* Main Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">
            Field Guide to GRE Vocabulary
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

        <div className="flex items-center gap-2">
          {s.strugglingCount > 0 && (
            <Button variant="rust" onClick={onStartCram}>
              Cram {s.strugglingCount} weak word{s.strugglingCount === 1 ? '' : 's'}
            </Button>
          )}
          <Button onClick={onStartLearning}>Start Learning →</Button>
        </div>
      </motion.header>

      {/* Today's Study & Session Recap Card */}
      {(todaySummaries.length > 0 || sessionSummaries.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-(--color-gold)/30 bg-gradient-to-r from-(--color-gold-soft)/40 via-white/40 to-(--color-gold-soft)/20 dark:from-(--color-gold)/15 dark:via-white/5 dark:to-transparent p-5 mb-6 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-(--color-gold)/20 text-(--color-gold)">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-(--color-ink) dark:text-(--color-paper)">
                  Today's Words & Session Recap
                </p>
                <p className="text-xs text-(--color-slate)">
                  {todaySummaries.length} word{todaySummaries.length === 1 ? '' : 's'} studied today
                  {sessionSummaries.length > 0 ? ` (${sessionSummaries.length} in this session)` : ''} · {recapStats.accuracy}% recall accuracy
                </p>
              </div>
            </div>

            {onOpenRecap && (
              <Button onClick={onOpenRecap} className="text-xs px-3 py-1.5 flex items-center gap-1.5">
                <span>Review Recap ({todaySummaries.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {todaySummaries.slice(0, 10).map((item) => (
              <span
                key={item.word.id}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                  item.lastRating === 'again'
                    ? 'border-rose-400/40 bg-rose-50/50 dark:bg-rose-950/20 text-(--color-rust)'
                    : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 text-(--color-ink) dark:text-(--color-paper)'
                }`}
              >
                {item.word.word}
              </span>
            ))}
            {todaySummaries.length > 10 && (
              <span className="text-xs text-(--color-slate) pl-1">
                +{todaySummaries.length - 10} more
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* TOP SECTION: GRE Pacing, 8 Stat Cards, Today's Goal */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-xl border border-(--color-gold)/30 bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10 p-5 mb-5 shadow-xs"
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
                {s.wordsIntroduced} / {s.totalWords} introduced
              </p>
            </div>
            <ProgressBar value={s.studyPlan.progressPercent / 100} color="var(--color-gold)" />
            <p className="text-xs text-(--color-slate) mt-2">
              {s.studyPlan.wordsRemaining > 0
                ? `Learn ~${s.studyPlan.newWordsPerDay} new words/day to finish the deck before your test`
                : 'All words introduced — focus on reviews and mastering struggling words'}
            </p>
          </>
        ) : (
          <p className="text-sm text-(--color-slate)">
            Set your GRE test date in Settings to get a personalized study pace.
          </p>
        )}
      </motion.div>

      {/* 8 Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard index={0} label="Total Words" value={s.totalWords} accent="var(--color-ink)" />
        <StatCard index={1} label="Words Learned" value={s.wordsLearned} accent="var(--color-verdigris)" />
        <StatCard index={2} label="Due Today" value={s.dueToday} accent="var(--color-rust)" />
        <StatCard index={3} label="New Remaining" value={s.newWordsRemaining} accent="var(--color-ink)" />
        <StatCard index={4} label="Accuracy" value={s.accuracy} suffix="%" accent="var(--color-verdigris)" />
        <StatCard index={5} label="Current Streak" value={s.currentStreak} suffix="days" accent="var(--color-gold)" />
        <StatCard index={6} label="Longest Streak" value={s.longestStreak} suffix="days" accent="var(--color-gold)" />
        <StatCard index={7} label="Mastered" value={s.wordsMastered} accent="var(--color-verdigris)" />
      </div>

      {/* Today's Goal Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5 mb-8"
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-display text-lg font-semibold">Today's Goal</p>
          <p className="text-sm text-(--color-slate)">
            {s.todayNewWords} / {s.dailyGoal} new words
          </p>
        </div>
        <ProgressBar
          value={s.dailyGoal > 0 ? s.todayNewWords / s.dailyGoal : 0}
          color="var(--color-verdigris)"
        />
      </motion.div>

      {/* Structured Curriculum Callout inside Dashboard linking directly to Groups */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="rounded-2xl border border-(--color-gold)/30 bg-gradient-to-r from-(--color-gold-soft)/40 via-white/40 to-transparent dark:from-(--color-gold)/15 dark:via-white/5 dark:to-transparent p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-(--color-gold) mb-1">
            <Layers className="w-4 h-4" />
            <span>Structured Curriculum</span>
          </div>
          <h2 className="font-display text-xl font-bold text-(--color-ink) dark:text-(--color-paper)">
            GRE Vocabulary Groups (1–34)
          </h2>
          <p className="text-xs sm:text-sm text-(--color-slate) mt-1 max-w-xl">
            Explore all 34 syllabus groups in the Groups section. Practice flashcards, take timed group tests, and master 1,000+ words systematically.
          </p>
        </div>

        {onViewAllSets && (
          <Button onClick={onViewAllSets} className="shrink-0 flex items-center gap-2">
            <span>Explore Groups Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </motion.div>

      {/* Achievements Section */}
      <div>
        <AchievementsPanel />
      </div>
    </div>
  );
}
