import type { Problem } from '@/core/types';

const difficultyColor: Record<Problem['difficulty'], string> = {
  easy: 'var(--color-verdigris)',
  medium: 'var(--color-gold)',
  hard: 'var(--color-rust)',
};

interface ProblemDetailProps {
  problem: Problem;
}

export function ProblemDetail({ problem }: ProblemDetailProps) {
  return (
    <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 p-6">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: difficultyColor[problem.difficulty],
            backgroundColor: `color-mix(in srgb, ${difficultyColor[problem.difficulty]} 15%, transparent)`,
          }}
        >
          {problem.difficulty}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-(--color-slate) font-semibold">
          {problem.subtopic}
        </span>
        {problem.challengeSet && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full text-(--color-gold) bg-(--color-gold-soft)/40">
            ★ 155–160 Challenge
          </span>
        )}
      </div>

      {problem.type === 'quant-comparison' ? (
        <div className="mb-4">
          <p className="font-display text-lg mb-3">{problem.prompt}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-(--color-ink)/10 dark:border-(--color-paper)/10 p-3">
              <p className="text-[10px] uppercase text-(--color-gold) font-semibold mb-1">Quantity A</p>
              <p className="font-mono text-xs">{problem.quantityA}</p>
            </div>
            <div className="rounded-lg border border-(--color-ink)/10 dark:border-(--color-paper)/10 p-3">
              <p className="text-[10px] uppercase text-(--color-gold) font-semibold mb-1">Quantity B</p>
              <p className="font-mono text-xs">{problem.quantityB}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="font-display text-lg font-semibold mb-4">{problem.prompt}</p>
      )}

      {problem.type === 'multiple-choice' && problem.choices && (
        <div className="grid gap-1.5 mb-4">
          {problem.choices.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg border px-3 py-2 text-xs font-mono ${
                c.id === problem.correctChoiceId
                  ? 'border-(--color-verdigris) bg-(--color-verdigris-soft)/30'
                  : 'border-(--color-ink)/10 dark:border-(--color-paper)/10'
              }`}
            >
              {c.text}
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-(--color-ink)/10 dark:border-(--color-paper)/10 pt-4">
        <p className="text-xs uppercase tracking-wide text-(--color-slate) font-semibold mb-2">Solution</p>
        <ol className="space-y-1.5">
          {problem.solutionSteps.map((step, i) => (
            <li key={i} className="text-sm leading-relaxed">
              <span className="text-(--color-gold) font-semibold mr-1.5">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        {problem.formula && <p className="text-xs text-(--color-slate) font-mono mt-3">{problem.formula}</p>}
      </div>
    </div>
  );
}
