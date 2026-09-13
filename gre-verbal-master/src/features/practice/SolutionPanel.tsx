import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { vocabRefs } from '@/store/useAppStore';
import type { ReviewRating, VerbalItem } from '@/core/types';

interface SolutionPanelProps {
  item: VerbalItem;
  wasCorrect: boolean;
  onRateConfidence: (rating: ReviewRating) => void;
  onContinue: () => void;
}

const confidenceOptions: { rating: ReviewRating; label: string; variant: 'secondary' | 'primary' | 'verdigris' }[] = [
  { rating: 'hard', label: 'Hard', variant: 'secondary' },
  { rating: 'good', label: 'Good', variant: 'primary' },
  { rating: 'easy', label: 'Easy', variant: 'verdigris' },
];

export function SolutionPanel({ item, wasCorrect, onRateConfidence, onContinue }: SolutionPanelProps) {
  const relatedVocabIds = (item.type === 'text-completion' || item.type === 'sentence-equivalence') ? item.vocabWordIds ?? [] : [];
  const relatedVocab = vocabRefs.filter((v) => relatedVocabIds.includes(v.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-6"
    >
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          wasCorrect
            ? 'bg-(--color-verdigris-soft)/50 text-(--color-verdigris)'
            : 'bg-(--color-rust-soft)/50 text-(--color-rust)'
        }`}
      >
        {wasCorrect ? 'Correct' : 'Incorrect'}
      </span>

      <ol className="space-y-2 my-4">
        {item.solutionSteps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="shrink-0 w-5 h-5 rounded-full bg-(--color-gold-soft)/60 text-(--color-ink) flex items-center justify-center text-[11px] font-semibold">
              {i + 1}
            </span>
            <span className="text-(--color-ink) dark:text-(--color-paper) leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {relatedVocab.length > 0 && (
        <div className="mb-4 rounded-lg border border-(--color-gold)/25 bg-(--color-gold-soft)/20 p-3">
          <p className="text-[10px] uppercase tracking-wide text-(--color-gold) font-semibold mb-2">
            From your vocab list
          </p>
          <div className="grid gap-2">
            {relatedVocab.map((v) => (
              <div key={v.id} className="text-xs">
                <span className="font-display font-semibold">{v.word}</span>
                <span className="text-(--color-slate)"> — {v.meaning}</span>
                {v.mnemonic && <p className="text-(--color-slate) italic mt-0.5">{v.mnemonic}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {wasCorrect ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-(--color-slate) font-semibold mb-2">
            How hard was that?
          </p>
          <div className="flex gap-2">
            {confidenceOptions.map((opt) => (
              <Button key={opt.rating} variant={opt.variant} onClick={() => onRateConfidence(opt.rating)}>
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <Button variant="rust" onClick={onContinue}>
          Continue →
        </Button>
      )}
    </motion.div>
  );
}
