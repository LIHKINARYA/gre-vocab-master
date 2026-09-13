import type { SentenceEquivalenceItem } from '@/core/types';
import type { SEAnswer } from '@/core/grading';

interface SentenceEquivalencePromptProps {
  item: SentenceEquivalenceItem;
  answer: SEAnswer;
  onToggle: (choiceId: string) => void;
  disabled: boolean;
}

export function SentenceEquivalencePrompt({ item, answer, onToggle, disabled }: SentenceEquivalencePromptProps) {
  const sentenceParts = item.sentenceText.split('(( ))');

  return (
    <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] uppercase tracking-wider text-(--color-gold) font-semibold px-2 py-0.5 rounded-full bg-(--color-gold-soft)/40">
          Sentence Equivalence
        </span>
        <span className="text-[10px] uppercase tracking-wider text-(--color-slate) font-semibold">
          {item.subtopic}
        </span>
      </div>

      <p className="font-display text-lg leading-relaxed text-(--color-ink) dark:text-(--color-paper) mb-2">
        {sentenceParts[0]}
        <span className="inline-block mx-1 px-3 py-0.5 rounded-md border-b-2 border-(--color-gold) bg-(--color-gold-soft)/30 font-mono text-sm font-semibold">
          blank
        </span>
        {sentenceParts[1]}
      </p>
      <p className="text-xs text-(--color-slate) mb-6">Select the two answer choices that best complete the sentence and produce sentences that are equivalent in meaning.</p>

      <div className="grid gap-1.5">
        {item.choices.map((choice) => {
          const isSelected = answer.choiceIds.includes(choice.id);
          const isCorrectChoice = item.correctChoiceIds.includes(choice.id);
          const maxReached = answer.choiceIds.length >= 2 && !isSelected;
          let style = 'border-(--color-ink)/15 dark:border-(--color-paper)/15 hover:border-(--color-gold)/50';
          if (disabled) {
            if (isCorrectChoice) style = 'border-(--color-verdigris) bg-(--color-verdigris-soft)/40 dark:bg-(--color-verdigris)/10';
            else if (isSelected) style = 'border-(--color-rust) bg-(--color-rust-soft)/40 dark:bg-(--color-rust)/10';
            else style = 'border-(--color-ink)/10 dark:border-(--color-paper)/10 opacity-50';
          } else if (isSelected) {
            style = 'border-(--color-gold) bg-(--color-gold-soft)/40';
          } else if (maxReached) {
            style = 'border-(--color-ink)/10 dark:border-(--color-paper)/10 opacity-40';
          }
          return (
            <button
              key={choice.id}
              type="button"
              disabled={disabled || maxReached}
              onClick={() => onToggle(choice.id)}
              className={`text-left rounded-lg border px-4 py-2.5 text-sm font-mono transition-all disabled:pointer-events-none ${style}`}
            >
              {choice.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
