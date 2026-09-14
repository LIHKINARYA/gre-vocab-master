import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { QuizQuestion } from '@/core/quiz/quizGenerator';

const typeLabel: Record<QuizQuestion['type'], string> = {
  define: 'What does this word mean?',
  reverse: 'Which word matches this meaning?',
  synonym: 'Find the closest synonym',
};

interface QuizQuestionCardProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  answered: boolean;
  onSelect: (optionId: string) => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuizQuestionCard({
  question,
  selectedOptionId,
  answered,
  onSelect,
  onNext,
  isLast,
}: QuizQuestionCardProps) {
  return (
    <div className="rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-8 min-h-[380px] flex flex-col">
      <p className="text-xs uppercase tracking-wider text-(--color-gold) font-semibold mb-2">
        {typeLabel[question.type]}
      </p>
      <h2
        className={`font-display font-semibold text-(--color-ink) dark:text-(--color-paper) mb-6 ${
          question.type === 'define' ? 'text-4xl' : 'text-xl leading-snug'
        }`}
      >
        {question.prompt}
      </h2>

      <div className="grid gap-2 flex-1">
        {question.options.map((opt) => {
          const isCorrectOpt = opt.id === question.correctOptionId;
          const isSelected = opt.id === selectedOptionId;

          let style = 'border-(--color-ink)/15 dark:border-(--color-paper)/15 hover:border-(--color-gold)/50';
          if (answered) {
            if (isCorrectOpt) {
              style = 'border-(--color-verdigris) bg-(--color-verdigris-soft)/40 dark:bg-(--color-verdigris)/10';
            } else if (isSelected) {
              style = 'border-(--color-rust) bg-(--color-rust-soft)/40 dark:bg-(--color-rust)/10';
            } else {
              style = 'border-(--color-ink)/10 dark:border-(--color-paper)/10 opacity-50';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => onSelect(opt.id)}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-all disabled:pointer-events-none ${style}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-end"
          >
            <Button onClick={onNext}>{isLast ? 'See results →' : 'Next →'}</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
