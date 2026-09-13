import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import type { QuizConfig, QuizSource } from './useQuizSession';
import { sourceCount } from './useQuizSession';

const topicSources: { id: QuizSource; label: string }[] = [
  { id: 'all', label: 'All topics (mixed)' },
  { id: 'arithmetic', label: 'Arithmetic' },
  { id: 'algebra', label: 'Algebra' },
  { id: 'geometry', label: 'Geometry' },
  { id: 'data-analysis', label: 'Data Analysis' },
  { id: 'word-problems', label: 'Word Problems' },
];

const specialSources: { id: QuizSource; label: string; hint: string }[] = [
  { id: 'due', label: 'Due for review', hint: 'What the SRS says to revisit now' },
  { id: 'struggling', label: 'Cram weak problems', hint: 'Low ease-factor or repeatedly missed' },
  { id: 'challenge', label: '155–160 Challenge Set', hint: 'Curated hardest problems for the top score band' },
];

const counts = [10, 20, 27, 40];

interface QuizSetupProps {
  config: QuizConfig;
  setConfig: (updater: (c: QuizConfig) => QuizConfig) => void;
  onStart: () => void;
}

export function QuizSetup({ config, setConfig, onStart }: QuizSetupProps) {
  const cards = useAppStore((s) => s.cards);
  const available = sourceCount(config.source, cards);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Timed Quiz</p>
      <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper) mb-6">
        Simulate a section
      </h1>

      <div className="mb-6">
        <p className="text-sm font-semibold mb-2">Focus</p>
        <div className="grid sm:grid-cols-3 gap-2 mb-2">
          {specialSources.map((s) => {
            const count = sourceCount(s.id, cards);
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
        <div className="flex flex-wrap gap-2">
          {topicSources.map((s) => {
            const count = sourceCount(s.id, cards);
            const active = config.source === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, source: s.id }))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'border-(--color-gold) bg-(--color-gold-soft)/50 text-(--color-ink) dark:text-(--color-paper)'
                    : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:border-(--color-gold)/40'
                }`}
              >
                {s.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
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
              {n} {n === 27 && '(full section)'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={config.timed}
            onChange={(e) => setConfig((c) => ({ ...c, timed: e.target.checked }))}
            className="w-4 h-4 accent-(--color-gold)"
          />
          Timed mode — mimics real GRE Quant pacing (~1:45/question on average)
        </label>
      </div>

      {available === 0 ? (
        <p className="text-sm text-(--color-rust) mb-4">
          No problems in this pool yet — try a different source, or practice some new problems first.
        </p>
      ) : (
        <p className="text-sm text-(--color-slate) mb-4">
          {Math.min(available, config.count)} question{Math.min(available, config.count) === 1 ? '' : 's'} ·
          correct/incorrect answers feed straight into your SRS review schedule
        </p>
      )}

      <Button onClick={onStart} disabled={available === 0}>
        Start Quiz →
      </Button>
    </motion.div>
  );
}
