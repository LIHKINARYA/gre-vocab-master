import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { QuizConfig, QuizSource } from './useQuizSession';
import { sourceWordCount } from './useQuizSession';
import { useAppStore } from '@/store/useAppStore';
import type { QuizQuestionType } from '@/core/quiz/quizGenerator';
import { getMicroSets } from '@/core/sets/microSets';
import { Layers } from 'lucide-react';

const sources: { id: QuizSource; label: string; hint: string }[] = [
  { id: 'today', label: "Today's Words", hint: 'Words reviewed or encountered today' },
  { id: 'session', label: 'Current Session', hint: 'Words in your active study session' },
  { id: 'due', label: 'Due for review', hint: 'Words the SRS says you should revisit now' },
  { id: 'struggling', label: 'Cram weak words', hint: 'Low ease-factor or repeatedly missed' },
  { id: 'learned', label: 'Everything learned', hint: 'All words you have started' },
  { id: 'new', label: 'Not started yet', hint: 'First exposure, quiz-style' },
  { id: 'all', label: 'Whole word bank', hint: 'Full mock-test pool' },
];

const modes: { id: QuizConfig['mode']; label: string }[] = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'define', label: 'Word → Meaning' },
  { id: 'reverse', label: 'Meaning → Word' },
  { id: 'synonym', label: 'Synonym match' },
];

const counts = [10, 15, 25, 50];

interface QuizSetupProps {
  config: QuizConfig;
  setConfig: (updater: (c: QuizConfig) => QuizConfig) => void;
  onStart: () => void;
}

export function QuizSetup({ config, setConfig, onStart }: QuizSetupProps) {
  const cards = useAppStore((s) => s.cards);
  const available = sourceWordCount(config.source, cards);
  const microSets = getMicroSets();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Quiz Mode</p>
      <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper) mb-6">
        Test yourself
      </h1>

      <div className="mb-6">
        <p className="text-sm font-semibold mb-2">Question pool</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          {sources.map((s) => {
            const count = sourceWordCount(s.id, cards);
            const active = config.source === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, source: s.id }))}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active
                    ? 'border-(--color-gold) bg-(--color-gold-soft)/40 dark:bg-(--color-gold)/10'
                    : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 hover:border-(--color-gold)/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{s.label}</span>
                  <span className="text-xs font-mono text-(--color-slate)">{count}</span>
                </div>
                <p className="text-xs text-(--color-slate) mt-0.5">{s.hint}</p>
              </button>
            );
          })}
        </div>

        {/* Group Question Pool Integration */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-(--color-slate) uppercase tracking-wider mb-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-(--color-gold)" />
            <span>Or Take a Specific Group Test (Groups 1–34)</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
            {microSets.map((set) => {
              const setSourceId: QuizSource = `set-${set.id}`;
              const active = config.source === setSourceId;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setConfig((c) => ({ ...c, source: setSourceId, count: Math.min(30, set.wordIds.length) }))}
                  className={`text-left rounded-xl border p-2.5 transition-colors ${
                    active
                      ? 'border-(--color-gold) bg-(--color-gold-soft)/50 dark:bg-(--color-gold)/15'
                      : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 hover:border-(--color-gold)/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-(--color-ink) dark:text-(--color-paper) truncate">
                      {set.title}
                    </span>
                    <span className="text-[10px] font-mono text-(--color-gold) ml-1 shrink-0">{set.wordIds.length}w</span>
                  </div>
                  <p className="text-[11px] text-(--color-slate) truncate mt-0.5">{set.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      <div className="mb-6">
        <p className="text-sm font-semibold mb-2">Question type</p>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setConfig((c) => ({ ...c, mode: m.id as QuizQuestionType | 'mixed' }))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                config.mode === m.id
                  ? 'border-(--color-gold) bg-(--color-gold-soft)/50 text-(--color-ink) dark:text-(--color-paper)'
                  : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:border-(--color-gold)/40'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold mb-2">Length</p>
        <div className="flex flex-wrap gap-2">
          {counts.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setConfig((c) => ({ ...c, count: n }))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                config.count === n
                  ? 'border-(--color-gold) bg-(--color-gold-soft)/50 text-(--color-ink) dark:text-(--color-paper)'
                  : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:border-(--color-gold)/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {available === 0 ? (
        <p className="text-sm text-(--color-rust) mb-4">
          No words in this pool yet — try a different source, or learn some new words first.
        </p>
      ) : (
        <p className="text-sm text-(--color-slate) mb-4">
          {Math.min(available, config.count)} question{Math.min(available, config.count) === 1 ? '' : 's'} ·
          correct answers count as SRS reviews
        </p>
      )}

      <Button onClick={onStart} disabled={available === 0}>
        Start Quiz →
      </Button>
    </motion.div>
  );
}
