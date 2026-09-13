import { useAppStore } from '@/store/useAppStore';
import type { VerbalItem } from '@/core/types';

const difficultyColor: Record<VerbalItem['difficulty'], string> = {
  easy: 'var(--color-verdigris)',
  medium: 'var(--color-gold)',
  hard: 'var(--color-rust)',
};

const topicLabels: Record<VerbalItem['topic'], string> = {
  'text-completion': 'Text Completion',
  'sentence-equivalence': 'Sentence Equivalence',
  'reading-comprehension': 'Reading Comprehension',
};

interface ItemDetailProps {
  item: VerbalItem;
}

export function ItemDetail({ item }: ItemDetailProps) {
  const getPassage = useAppStore((s) => s.getPassage);
  const passage = item.type === 'reading-comprehension' ? getPassage(item.passageId) : undefined;

  return (
    <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 p-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: difficultyColor[item.difficulty],
            backgroundColor: `color-mix(in srgb, ${difficultyColor[item.difficulty]} 15%, transparent)`,
          }}
        >
          {item.difficulty}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-(--color-slate) font-semibold">
          {topicLabels[item.topic]} · {item.subtopic}
        </span>
      </div>

      {item.type === 'text-completion' && (
        <>
          <p className="font-display text-base leading-relaxed mb-4">{item.passageText}</p>
          {item.blanks.map((b) => (
            <div key={b.id} className="mb-3">
              <p className="text-xs uppercase text-(--color-gold) font-semibold mb-1">Blank ({b.id})</p>
              <div className="grid gap-1">
                {b.choices.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${
                      c.id === b.correctChoiceId
                        ? 'border-(--color-verdigris) bg-(--color-verdigris-soft)/30'
                        : 'border-(--color-ink)/10 dark:border-(--color-paper)/10'
                    }`}
                  >
                    {c.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {item.type === 'sentence-equivalence' && (
        <>
          <p className="font-display text-base leading-relaxed mb-4">
            {item.sentenceText.replace('(( ))', '_____')}
          </p>
          <div className="grid gap-1 mb-4">
            {item.choices.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${
                  item.correctChoiceIds.includes(c.id)
                    ? 'border-(--color-verdigris) bg-(--color-verdigris-soft)/30'
                    : 'border-(--color-ink)/10 dark:border-(--color-paper)/10'
                }`}
              >
                {c.text}
              </div>
            ))}
          </div>
        </>
      )}

      {item.type === 'reading-comprehension' && (
        <>
          {passage && (
            <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-(--color-ink)/10 dark:border-(--color-paper)/10 p-3">
              <p className="text-xs font-semibold mb-1">{passage.title}</p>
              {passage.text.split('\n').map((p, i) => (
                <p key={i} className="text-xs text-(--color-slate) mb-2 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          )}
          <p className="font-display text-base font-semibold mb-3">{item.prompt}</p>
          <div className="grid gap-1 mb-4">
            {item.choices.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  item.correctChoiceIds.includes(c.id)
                    ? 'border-(--color-verdigris) bg-(--color-verdigris-soft)/30'
                    : 'border-(--color-ink)/10 dark:border-(--color-paper)/10'
                }`}
              >
                {c.text}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="border-t border-(--color-ink)/10 dark:border-(--color-paper)/10 pt-4">
        <p className="text-xs uppercase tracking-wide text-(--color-slate) font-semibold mb-2">Solution</p>
        <ol className="space-y-1.5">
          {item.solutionSteps.map((step, i) => (
            <li key={i} className="text-sm leading-relaxed">
              <span className="text-(--color-gold) font-semibold mr-1.5">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
