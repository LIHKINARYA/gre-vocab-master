import type { Problem } from '@/core/types';

type Comparison = 'A' | 'B' | 'equal' | 'cannot-determine';

interface ProblemPromptProps {
  problem: Problem;
  selectedChoiceId: string | null;
  setSelectedChoiceId: (id: string) => void;
  selectedComparison: Comparison | null;
  setSelectedComparison: (c: Comparison) => void;
  numericInput: string;
  setNumericInput: (v: string) => void;
  disabled: boolean;
  wasCorrect: boolean | null;
  correctChoiceId?: string;
  correctComparison?: Comparison;
  onSubmitViaEnter?: () => void;
}

const comparisonOptions: { id: Comparison; label: string }[] = [
  { id: 'A', label: 'Quantity A is greater' },
  { id: 'B', label: 'Quantity B is greater' },
  { id: 'equal', label: 'The two quantities are equal' },
  { id: 'cannot-determine', label: 'Cannot be determined from the information given' },
];

const difficultyColor: Record<Problem['difficulty'], string> = {
  easy: 'var(--color-verdigris)',
  medium: 'var(--color-gold)',
  hard: 'var(--color-rust)',
};

export function ProblemPrompt({
  problem,
  selectedChoiceId,
  setSelectedChoiceId,
  selectedComparison,
  setSelectedComparison,
  numericInput,
  setNumericInput,
  disabled,
  wasCorrect,
  correctChoiceId,
  correctComparison,
  onSubmitViaEnter,
}: ProblemPromptProps) {
  return (
    <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-8">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
          style={{ color: difficultyColor[problem.difficulty], backgroundColor: `color-mix(in srgb, ${difficultyColor[problem.difficulty]} 15%, transparent)` }}
        >
          {problem.difficulty}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-(--color-slate) font-semibold">
          {problem.subtopic}
        </span>
      </div>

      {problem.type === 'quant-comparison' ? (
        <div className="mb-6">
          <p className="font-display text-lg text-(--color-ink) dark:text-(--color-paper) mb-4">{problem.prompt}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 p-4">
              <p className="text-xs uppercase tracking-wide text-(--color-gold) font-semibold mb-1">Quantity A</p>
              <p className="font-mono text-sm">{problem.quantityA}</p>
            </div>
            <div className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 p-4">
              <p className="text-xs uppercase tracking-wide text-(--color-gold) font-semibold mb-1">Quantity B</p>
              <p className="font-mono text-sm">{problem.quantityB}</p>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="font-display text-xl font-semibold text-(--color-ink) dark:text-(--color-paper) mb-6 leading-snug">
          {problem.prompt}
        </h2>
      )}

      {problem.type === 'multiple-choice' && (
        <div className="grid gap-2">
          {problem.choices?.map((choice) => {
            const isSelected = choice.id === selectedChoiceId;
            const isCorrectChoice = choice.id === correctChoiceId;
            let style = 'border-(--color-ink)/15 dark:border-(--color-paper)/15 hover:border-(--color-gold)/50';
            if (disabled) {
              if (isCorrectChoice) style = 'border-(--color-verdigris) bg-(--color-verdigris-soft)/40 dark:bg-(--color-verdigris)/10';
              else if (isSelected) style = 'border-(--color-rust) bg-(--color-rust-soft)/40 dark:bg-(--color-rust)/10';
              else style = 'border-(--color-ink)/10 dark:border-(--color-paper)/10 opacity-50';
            } else if (isSelected) {
              style = 'border-(--color-gold) bg-(--color-gold-soft)/40';
            }
            return (
              <button
                key={choice.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedChoiceId(choice.id)}
                className={`text-left rounded-xl border px-4 py-3 text-sm font-mono transition-all disabled:pointer-events-none ${style}`}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
      )}

      {problem.type === 'quant-comparison' && (
        <div className="grid gap-2">
          {comparisonOptions.map((opt) => {
            const isSelected = opt.id === selectedComparison;
            const isCorrectOpt = opt.id === correctComparison;
            let style = 'border-(--color-ink)/15 dark:border-(--color-paper)/15 hover:border-(--color-gold)/50';
            if (disabled) {
              if (isCorrectOpt) style = 'border-(--color-verdigris) bg-(--color-verdigris-soft)/40 dark:bg-(--color-verdigris)/10';
              else if (isSelected) style = 'border-(--color-rust) bg-(--color-rust-soft)/40 dark:bg-(--color-rust)/10';
              else style = 'border-(--color-ink)/10 dark:border-(--color-paper)/10 opacity-50';
            } else if (isSelected) {
              style = 'border-(--color-gold) bg-(--color-gold-soft)/40';
            }
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedComparison(opt.id)}
                className={`text-left rounded-xl border px-4 py-3 text-sm transition-all disabled:pointer-events-none ${style}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {problem.type === 'numeric-entry' && (
        <div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              disabled={disabled}
              value={numericInput}
              onChange={(e) => setNumericInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSubmitViaEnter) onSubmitViaEnter();
              }}
              placeholder="Your answer"
              className="w-48 rounded-xl border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-transparent px-4 py-3 text-sm font-mono focus:outline-none focus:border-(--color-gold) disabled:opacity-60"
            />
            {problem.unit && <span className="text-sm text-(--color-slate)">{problem.unit}</span>}
          </div>
          {disabled && wasCorrect === false && (
            <p className="mt-3 text-sm text-(--color-rust)">
              Correct answer: <span className="font-mono">{problem.correctValue}</span>
              {problem.unit ? ` ${problem.unit}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
