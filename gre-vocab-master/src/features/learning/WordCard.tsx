import { motion, AnimatePresence } from 'framer-motion';
import type { Word } from '@/core/types';

const difficultyColor: Record<Word['difficulty'], string> = {
  easy: 'var(--color-verdigris)',
  medium: 'var(--color-gold)',
  hard: 'var(--color-rust)',
};

interface WordCardProps {
  word: Word;
  revealed: boolean;
}

export function WordCard({ word, revealed }: WordCardProps) {
  return (
    <div className="relative rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-8 min-h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <span
          className="text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full"
          style={{ color: difficultyColor[word.difficulty], backgroundColor: `color-mix(in srgb, ${difficultyColor[word.difficulty]} 15%, transparent)` }}
        >
          {word.difficulty}
        </span>
        <span className="text-xs text-(--color-slate) italic">{word.partOfSpeech}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="font-display text-5xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          {word.word}
        </h2>
        <p className="mt-2 font-mono text-sm text-(--color-slate)">/{word.pronunciation}/</p>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.p
              key="prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-8 text-(--color-slate) text-base"
            >
              What does this mean?
            </motion.p>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 text-left w-full space-y-4"
            >
              <p className="text-lg text-(--color-ink) dark:text-(--color-paper)">{word.meaning}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-(--color-verdigris) font-semibold mb-1">
                    Synonyms
                  </p>
                  <p className="text-(--color-slate)">{word.synonyms.join(', ')}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-(--color-rust) font-semibold mb-1">
                    Antonyms
                  </p>
                  <p className="text-(--color-slate)">{word.antonyms.join(', ')}</p>
                </div>
              </div>

              <div className="rounded-lg bg-(--color-gold-soft)/40 dark:bg-(--color-gold)/10 p-3 text-sm">
                <p className="text-[11px] uppercase tracking-wide text-(--color-gold) font-semibold mb-1">
                  Memory trick
                </p>
                <p className="text-(--color-ink) dark:text-(--color-paper)">{word.mnemonic}</p>
              </div>

              <div className="text-sm space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-(--color-slate) font-semibold">
                  Examples
                </p>
                <p className="text-(--color-ink)/80 dark:text-(--color-paper)/80 italic">
                  "{word.exampleSentences[0]}"
                </p>
                <p className="text-(--color-ink)/80 dark:text-(--color-paper)/80 italic">
                  "{word.exampleSentences[1]}"
                </p>
              </div>

              <p className="text-xs text-(--color-slate)">
                Root: <span className="font-mono">{word.root}</span> · {word.etymology}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
