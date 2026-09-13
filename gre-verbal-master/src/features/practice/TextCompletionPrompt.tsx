import type { TextCompletionItem } from '@/core/types';
import type { TCAnswer } from '@/core/grading';

interface TextCompletionPromptProps {
  item: TextCompletionItem;
  answer: TCAnswer;
  onSelect: (blankId: string, choiceId: string) => void;
  disabled: boolean;
}

/** Splits passage text on (i)/(ii)/(iii) markers, rendering each as a highlighted blank tag. */
function renderPassageWithBlanks(passageText: string, blanks: TextCompletionItem['blanks']) {
  const segments: Array<{ type: 'text'; text: string } | { type: 'blank'; blankId: string }> = [];
  const markers = blanks.map((b) => `(${b.id})`);

  const pattern = new RegExp(`(${markers.map((m) => m.replace(/[()]/g, '\\$&')).join('|')})`, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(passageText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: passageText.slice(lastIndex, match.index) });
    }
    const blankId = match[0].slice(1, -1); // strip parens
    segments.push({ type: 'blank', blankId });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < passageText.length) {
    segments.push({ type: 'text', text: passageText.slice(lastIndex) });
  }
  return segments;
}

export function TextCompletionPrompt({ item, answer, onSelect, disabled }: TextCompletionPromptProps) {
  const segments = renderPassageWithBlanks(item.passageText, item.blanks);

  return (
    <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] uppercase tracking-wider text-(--color-gold) font-semibold px-2 py-0.5 rounded-full bg-(--color-gold-soft)/40">
          {item.blanksCount === 1 ? 'One Blank' : item.blanksCount === 2 ? 'Two Blanks' : 'Three Blanks'}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-(--color-slate) font-semibold">
          {item.subtopic}
        </span>
      </div>

      <p className="font-display text-lg leading-relaxed text-(--color-ink) dark:text-(--color-paper) mb-6">
        {segments.map((seg, i) =>
          seg.type === 'text' ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <span
              key={i}
              className="inline-block mx-1 px-2 py-0.5 rounded-md border-b-2 border-(--color-gold) bg-(--color-gold-soft)/30 font-mono text-sm font-semibold"
            >
              blank ({seg.blankId})
            </span>
          ),
        )}
      </p>

      <div className={`grid gap-6 ${item.blanks.length > 1 ? 'sm:grid-cols-2' : ''} ${item.blanks.length === 3 ? 'sm:grid-cols-3' : ''}`}>
        {item.blanks.map((blank) => (
          <div key={blank.id}>
            <p className="text-xs uppercase tracking-wide text-(--color-slate) font-semibold mb-2">
              Blank ({blank.id})
            </p>
            <div className="grid gap-1.5">
              {blank.choices.map((choice) => {
                const isSelected = answer.blankChoiceIds[blank.id] === choice.id;
                const isCorrectChoice = choice.id === blank.correctChoiceId;
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
                    onClick={() => onSelect(blank.id, choice.id)}
                    className={`text-left rounded-lg border px-3 py-2 text-sm transition-all disabled:pointer-events-none ${style}`}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
