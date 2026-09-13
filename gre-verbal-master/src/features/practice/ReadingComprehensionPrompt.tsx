import { useState } from 'react';
import type { Passage, ReadingComprehensionItem } from '@/core/types';
import type { RCAnswer } from '@/core/grading';

interface ReadingComprehensionPromptProps {
  item: ReadingComprehensionItem;
  passage: Passage | undefined;
  answer: RCAnswer;
  onToggle: (choiceId: string) => void;
  disabled: boolean;
}

export function ReadingComprehensionPrompt({ item, passage, answer, onToggle, disabled }: ReadingComprehensionPromptProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-base font-semibold text-(--color-ink) dark:text-(--color-paper)">
            {passage?.title ?? 'Passage'}
          </p>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="text-xs text-(--color-gold) font-semibold shrink-0"
          >
            {collapsed ? 'Show passage' : 'Hide passage'}
          </button>
        </div>
        {!collapsed && (
          <div className="max-h-64 overflow-y-auto pr-1">
            {passage?.text.split('\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-(--color-ink) dark:text-(--color-paper) mb-3 last:mb-0">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] uppercase tracking-wider text-(--color-gold) font-semibold px-2 py-0.5 rounded-full bg-(--color-gold-soft)/40">
            {item.subtopic}
          </span>
          {item.questionType === 'multi' && (
            <span className="text-[10px] uppercase tracking-wider text-(--color-rust) font-semibold">
              Select all that apply
            </span>
          )}
        </div>
        <p className="font-display text-base font-semibold text-(--color-ink) dark:text-(--color-paper) mb-4">
          {item.prompt}
        </p>

        <div className="grid gap-1.5">
          {item.choices.map((choice) => {
            const isSelected = answer.choiceIds.includes(choice.id);
            const isCorrectChoice = item.correctChoiceIds.includes(choice.id);
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
                onClick={() => onToggle(choice.id)}
                className={`text-left rounded-lg border px-4 py-2.5 text-sm transition-all disabled:pointer-events-none ${style}`}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
