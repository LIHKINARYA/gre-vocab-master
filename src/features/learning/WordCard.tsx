import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Bookmark, Heart, Edit3, Check } from 'lucide-react';
import type { Word } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';

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
  const card = useAppStore((s) => s.cards[word.id]);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setPersonalNotes = useAppStore((s) => s.setPersonalNotes);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(card?.personalNotes || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isBookmarked = !!card?.bookmarked;
  const isFavorite = !!card?.favorite;
  const currentNotes = card?.personalNotes || '';

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveNotes = () => {
    setPersonalNotes(word.id, notesInput.trim());
    setIsEditingNotes(false);
  };

  return (
    <div className="relative rounded-2xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5 shadow-sm p-8 min-h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
            style={{
              color: difficultyColor[word.difficulty],
              backgroundColor: `color-mix(in srgb, ${difficultyColor[word.difficulty]} 15%, transparent)`,
            }}
          >
            {word.difficulty}
          </span>
          <span className="text-xs text-(--color-slate) italic">{word.partOfSpeech}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleBookmark(word.id)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark word'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isBookmarked
                ? 'border-(--color-gold) text-(--color-gold) bg-(--color-gold-soft)/30'
                : 'border-transparent text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper) hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(word.id)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isFavorite
                ? 'border-(--color-rust) text-(--color-rust) bg-(--color-rust-soft)/30'
                : 'border-transparent text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper) hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="font-display text-5xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          {word.word}
        </h2>

        <div className="flex items-center gap-2 mt-2">
          <p className="font-mono text-sm text-(--color-slate)">/{word.pronunciation}/</p>
          <button
            type="button"
            onClick={handleSpeak}
            title="Listen to pronunciation"
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              isPlayingAudio ? 'text-(--color-gold)' : 'text-(--color-slate)'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

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
              exit={{ opacity: 0, y: -12 }}
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

              <div className="rounded-lg border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-black/[0.02] dark:bg-white/[0.02] p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] uppercase tracking-wide text-(--color-slate) font-semibold">
                    Personal Notes & Mnemonics
                  </p>
                  {!isEditingNotes ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNotesInput(currentNotes);
                        setIsEditingNotes(true);
                      }}
                      className="text-xs text-(--color-gold) hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      {currentNotes ? 'Edit' : 'Add note'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="text-xs text-(--color-verdigris) hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Add personal associations, rhymes, or tips..."
                      rows={2}
                      className="w-full text-xs rounded border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white dark:bg-black/20 p-2 text-(--color-ink) dark:text-(--color-paper) resize-none"
                    />
                  </div>
                ) : currentNotes ? (
                  <p className="text-xs text-(--color-ink)/90 dark:text-(--color-paper)/90 italic">
                    "{currentNotes}"
                  </p>
                ) : (
                  <p className="text-xs text-(--color-slate) italic">No personal notes yet.</p>
                )}
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
