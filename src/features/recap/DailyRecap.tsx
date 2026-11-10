import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Zap,
  Calendar,
  Search,
} from 'lucide-react';
import { useSessionRecap, type RecapFilter, type RecapSort } from '@/hooks/useSessionRecap';
import { RecapWordCard } from './RecapWordCard';
import { Button } from '@/components/ui/Button';
import type { Word } from '@/core/types';

interface DailyRecapProps {
  onStartFlashcards: (words: Word[], title: string) => void;
  onStartQuiz: (source: string, customWords?: Word[]) => void;
  onNavigateHome: () => void;
}

export function DailyRecap({ onStartFlashcards, onStartQuiz, onNavigateHome }: DailyRecapProps) {
  const {
    scope,
    setScope,
    filter,
    setFilter,
    sort,
    setSort,
    search,
    setSearch,
    sessionSummaries,
    todaySummaries,
    filteredSummaries,
    stats,
    resetSession,
  } = useSessionRecap('session');

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const activeWords = filteredSummaries.map((s) => s.word);
  const weakWords = (scope === 'session' ? sessionSummaries : todaySummaries)
    .filter((s) => s.lastRating === 'again' || s.hadFailureInScope)
    .map((s) => s.word);

  const handleReviewAllActive = () => {
    if (activeWords.length === 0) return;
    const title = scope === 'session' ? 'Session Recap Review' : "Today's Words Review";
    onStartFlashcards(activeWords, title);
  };

  const handleReviewWeak = () => {
    if (weakWords.length === 0) return;
    const title = scope === 'session' ? 'Session Weak Words' : "Today's Weak Words";
    onStartFlashcards(weakWords, title);
  };

  const handleQuizActive = () => {
    if (activeWords.length === 0) return;
    onStartQuiz(scope === 'session' ? 'session' : 'today', activeWords);
  };

  const handlePracticeSingle = (wordId: string) => {
    const item = filteredSummaries.find((s) => s.word.id === wordId);
    if (item) {
      onStartFlashcards([item.word], `Focused: ${item.word.word}`);
    }
  };

  const filterOptions: { id: RecapFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: stats.totalWords },
    { id: 'needs-work', label: 'Needs Practice', count: stats.needsWorkCount },
    { id: 'hard', label: 'Hard' },
    { id: 'good', label: 'Good' },
    { id: 'easy', label: 'Easy / Mastered', count: stats.masteredCount },
    { id: 'bookmarked', label: 'Starred' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header section */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Active Recall Review</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
            Session & Daily Recap
          </h1>
          <p className="text-sm text-(--color-slate) mt-1 max-w-xl">
            Review words you have encountered and internalized during this session or throughout today.
          </p>
        </div>

        {/* Scope Selector: This Session vs Today */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setScope('session')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              scope === 'session'
                ? 'bg-(--color-gold) text-(--color-ink) shadow-xs'
                : 'text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper)'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>This Session</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                scope === 'session' ? 'bg-black/15 text-(--color-ink)' : 'bg-black/5 dark:bg-white/10'
              }`}
            >
              {sessionSummaries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope('today')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              scope === 'today'
                ? 'bg-(--color-gold) text-(--color-ink) shadow-xs'
                : 'text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper)'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today (24h)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                scope === 'today' ? 'bg-black/15 text-(--color-ink)' : 'bg-black/5 dark:bg-white/10'
              }`}
            >
              {todaySummaries.length}
            </span>
          </button>
        </div>
      </motion.header>

      {/* KPI Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-(--color-slate)">Words Studied</p>
          <p className="font-display text-2xl font-bold text-(--color-ink) dark:text-(--color-paper) mt-1">
            {stats.totalWords}
          </p>
          <p className="text-[11px] text-(--color-slate) mt-0.5">
            {stats.totalReviews} total card review{stats.totalReviews === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-(--color-slate)">Recall Accuracy</p>
          <p className="font-display text-2xl font-bold text-(--color-verdigris) mt-1">
            {stats.accuracy}%
          </p>
          <p className="text-[11px] text-(--color-slate) mt-0.5">
            {stats.totalWords - stats.needsWorkCount} confident answers
          </p>
        </div>

        <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-(--color-slate)">Needs Practice</p>
          <p
            className={`font-display text-2xl font-bold mt-1 ${
              stats.needsWorkCount > 0 ? 'text-(--color-rust)' : 'text-(--color-slate)'
            }`}
          >
            {stats.needsWorkCount}
          </p>
          <p className="text-[11px] text-(--color-slate) mt-0.5">
            {stats.needsWorkCount > 0 ? 'Rated "Again" or lapsed' : 'Zero lapses so far!'}
          </p>
        </div>

        <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-(--color-slate)">Avg Response Speed</p>
          <p className="font-display text-2xl font-bold text-(--color-gold) mt-1">
            {stats.avgResponseTime}s
          </p>
          <p className="text-[11px] text-(--color-slate) mt-0.5">
            {stats.newWordsCount} new introduced
          </p>
        </div>
      </motion.div>

      {/* Review Actions Banner */}
      {stats.totalWords > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-(--color-gold)/30 bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10 p-5 mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-display text-base font-semibold text-(--color-ink) dark:text-(--color-paper)">
              Reinforce {scope === 'session' ? 'This Session’s' : "Today’s"} Vocabulary
            </h3>
            <p className="text-xs text-(--color-slate) mt-0.5 max-w-lg">
              Solidify neural pathways before short-term memory decays. Test active recall via flashcards or take an instant multiple-choice quiz.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {weakWords.length > 0 && (
              <Button
                variant="rust"
                onClick={handleReviewWeak}
                className="text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Drill {weakWords.length} Weak Words</span>
              </Button>
            )}

            <Button
              onClick={handleReviewAllActive}
              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Flashcard Review ({activeWords.length})</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleQuizActive}
              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quiz ({activeWords.length})</span>
            </Button>

            {scope === 'session' && (
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                title="Reset session counter for a fresh study block"
                className="text-xs text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper) px-2 py-1 underline cursor-pointer"
              >
                New session
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Reset Session Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white dark:bg-zinc-900 p-6 max-w-sm w-full shadow-xl"
          >
            <h4 className="font-display text-lg font-semibold mb-2">Start a New Session?</h4>
            <p className="text-xs text-(--color-slate) mb-5">
              This resets the "Current Session" list so you can track your next study block cleanly. Your overall daily progress and spaced repetition schedules will remain completely intact.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => setConfirmResetOpen(false)}>
                Cancel
              </Button>
              <Button
                className="text-xs px-3 py-1.5"
                onClick={() => {
                  resetSession();
                  setConfirmResetOpen(false);
                }}
              >
                Start New Session
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterOptions.map(({ id, label, count }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'border-(--color-gold) bg-(--color-gold-soft)/50 text-(--color-ink) dark:text-(--color-paper) font-semibold'
                    : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:border-(--color-gold)/40'
                }`}
              >
                <span>{label}</span>
                {typeof count === 'number' && (
                  <span className="font-mono text-[10px] opacity-75">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-(--color-slate) absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Filter words…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 pl-8 pr-3 py-1.5 text-xs"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as RecapSort)}
            className="rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/60 dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="first">First Studied</option>
            <option value="alpha">Alphabetical (A-Z)</option>
            <option value="difficulty">Difficulty</option>
            <option value="speed">Response Time</option>
          </select>
        </div>
      </div>

      {/* Main Word List / Empty State */}
      {filteredSummaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-(--color-ink)/15 dark:border-(--color-paper)/15 p-12 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-(--color-gold-soft)/40 dark:bg-(--color-gold)/15 text-(--color-gold) flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>

          <h3 className="font-display text-lg font-semibold text-(--color-ink) dark:text-(--color-paper) mb-1">
            {stats.totalWords === 0
              ? scope === 'session'
                ? 'No words reviewed in this active session yet'
                : 'No words reviewed today yet'
              : 'No words match the active filter'}
          </h3>

          <p className="text-xs text-(--color-slate) max-w-sm mx-auto mb-5">
            {stats.totalWords === 0
              ? 'Words appear here immediately as you practice flashcards or take diagnostic quizzes during your session.'
              : 'Try clearing your search query or switching filter tabs above.'}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {scope === 'session' && todaySummaries.length > 0 && (
              <Button variant="secondary" className="text-xs px-3.5 py-1.5" onClick={() => setScope('today')}>
                View {todaySummaries.length} Words Studied Earlier Today
              </Button>
            )}

            <Button className="text-xs px-3.5 py-1.5" onClick={onNavigateHome}>
              Start Learning Now →
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-(--color-slate) px-1 mb-1">
            <span>Showing {filteredSummaries.length} word{filteredSummaries.length === 1 ? '' : 's'}</span>
            <span className="italic">Use "Test Recall" on any word to check your memory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSummaries.map((summary) => (
              <RecapWordCard
                key={summary.word.id}
                summary={summary}
                onPracticeSingle={handlePracticeSingle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
