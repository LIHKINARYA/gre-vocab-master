import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Bookmark, Heart, CheckCircle2, Lightbulb, Eye, EyeOff, RotateCw, Clock } from 'lucide-react';
import type { WordReviewSummary } from '@/hooks/useSessionRecap';
import { useAppStore } from '@/store/useAppStore';

interface RecapWordCardProps {
  summary: WordReviewSummary;
  onPracticeSingle?: (wordId: string) => void;
}

const difficultyColor: Record<string, string> = {
  easy: 'var(--color-verdigris)',
  medium: 'var(--color-gold)',
  hard: 'var(--color-rust)',
};

const ratingBadgeConfig = {
  again: {
    label: 'Needs Practice',
    color: 'var(--color-rust)',
    bg: 'color-mix(in srgb, var(--color-rust) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-rust) 35%, transparent)',
  },
  hard: {
    label: 'Hard',
    color: 'var(--color-gold)',
    bg: 'color-mix(in srgb, var(--color-gold) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-gold) 35%, transparent)',
  },
  good: {
    label: 'Good Recall',
    color: '#0284c7',
    bg: 'color-mix(in srgb, #0284c7 15%, transparent)',
    border: 'color-mix(in srgb, #0284c7 35%, transparent)',
  },
  easy: {
    label: 'Mastered / Easy',
    color: 'var(--color-verdigris)',
    bg: 'color-mix(in srgb, var(--color-verdigris) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-verdigris) 35%, transparent)',
  },
};

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.round((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function RecapWordCard({ summary, onPracticeSingle }: RecapWordCardProps) {
  const { word, card, lastRating, lastReviewedAt, timesReviewedInScope, avgResponseTimeMs } = summary;
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleMastered = useAppStore((s) => s.toggleMastered);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTestedHidden, setIsTestedHidden] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isBookmarked = !!card?.bookmarked;
  const isFavorite = !!card?.favorite;
  const isMastered = !!card?.mastered;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const badge = ratingBadgeConfig[lastRating] || ratingBadgeConfig.good;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`rounded-2xl border transition-all ${
        lastRating === 'again'
          ? 'border-(--color-rust)/30 bg-rose-50/30 dark:bg-rose-950/10'
          : 'border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/70 dark:bg-white/5'
      } p-5 hover:border-(--color-gold)/40 shadow-xs`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSpeak}
            title="Listen to pronunciation"
            className="p-1.5 rounded-lg border border-(--color-ink)/10 dark:border-(--color-paper)/10 text-(--color-slate) hover:text-(--color-gold) hover:border-(--color-gold)/30 transition-colors cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-(--color-gold)' : ''}`} />
          </button>

          <h3 className="font-display text-xl font-bold text-(--color-ink) dark:text-(--color-paper) tracking-tight">
            {word.word}
          </h3>

          <span className="text-xs text-(--color-slate) font-mono">{word.pronunciation}</span>

          <span className="text-[11px] italic text-(--color-slate)">{word.partOfSpeech}</span>

          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: difficultyColor[word.difficulty],
              backgroundColor: `color-mix(in srgb, ${difficultyColor[word.difficulty]} 15%, transparent)`,
            }}
          >
            {word.difficulty}
          </span>
        </div>

        {/* Rating badge & tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
            style={{
              color: badge.color,
              backgroundColor: badge.bg,
              borderColor: badge.border,
            }}
          >
            {badge.label}
          </span>

          <button
            type="button"
            onClick={() => toggleBookmark(word.id)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark word'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-(--color-gold) bg-(--color-gold)/10'
                : 'text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper)'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(word.id)}
            title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isFavorite
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-(--color-slate) hover:text-rose-400'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => toggleMastered(word.id)}
            title={isMastered ? 'Mark unmastered' : 'Mark mastered'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isMastered
                ? 'text-(--color-verdigris) bg-(--color-verdigris)/10'
                : 'text-(--color-slate) hover:text-(--color-verdigris)'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Review metadata chips */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-slate) mb-3 pb-2 border-b border-(--color-ink)/5 dark:border-(--color-paper)/5">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-(--color-slate)" />
          <span>{formatRelativeTime(lastReviewedAt)}</span>
        </span>
        <span>•</span>
        <span>{timesReviewedInScope} review{timesReviewedInScope === 1 ? '' : 's'}</span>
        <span>•</span>
        <span>Avg speed: {(avgResponseTimeMs / 1000).toFixed(1)}s</span>
        {summary.isNewCard && (
          <span className="bg-(--color-gold)/15 text-(--color-gold) text-[10px] font-semibold px-2 py-0.5 rounded-md">
            New Word
          </span>
        )}
      </div>

      {/* Definition & Self-Recall Area */}
      <div className="relative mb-3">
        {isTestedHidden ? (
          <button
            type="button"
            onClick={() => setIsTestedHidden(false)}
            className="w-full py-4 px-3 rounded-xl border border-dashed border-(--color-gold)/40 bg-(--color-gold-soft)/20 dark:bg-(--color-gold)/5 text-center text-xs font-semibold text-(--color-gold) hover:bg-(--color-gold-soft)/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Definition hidden for recall test — Click to reveal</span>
          </button>
        ) : (
          <div>
            <p className="text-sm font-medium text-(--color-ink) dark:text-(--color-paper) leading-relaxed">
              {word.meaning}
            </p>

            {/* Mnemonic device */}
            {word.mnemonic && (
              <div className="mt-2.5 flex items-start gap-2 text-xs bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10 border border-(--color-gold)/20 rounded-xl p-2.5 text-(--color-ink) dark:text-(--color-paper)">
                <Lightbulb className="w-3.5 h-3.5 text-(--color-gold) shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-(--color-gold)">Mnemonic: </span>
                  <span>{word.mnemonic}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expandable Context & Sentences */}
      <AnimatePresence>
        {showDetails && !isTestedHidden && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-2.5 pt-2 text-xs border-t border-(--color-ink)/5 dark:border-(--color-paper)/5"
          >
            {word.exampleSentences && word.exampleSentences[0] && (
              <div className="italic text-(--color-slate) bg-black/5 dark:bg-white/5 p-2.5 rounded-xl">
                “{word.exampleSentences[0]}”
              </div>
            )}

            {word.synonyms && word.synonyms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <span className="font-semibold text-(--color-slate)">Synonyms:</span>
                {word.synonyms.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-(--color-ink)/5 dark:bg-(--color-paper)/5 text-(--color-ink) dark:text-(--color-paper)"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {word.commonGreUsage && (
              <div className="text-[11px] text-(--color-slate)">
                <span className="font-semibold text-(--color-gold)">GRE Context: </span>
                <span>{word.commonGreUsage}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-3 mt-1 text-xs">
        <button
          type="button"
          onClick={() => setIsTestedHidden((h) => !h)}
          className="text-(--color-slate) hover:text-(--color-gold) flex items-center gap-1 font-medium cursor-pointer transition-colors"
        >
          {isTestedHidden ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Definition</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Test Recall (Hide)</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDetails((d) => !d)}
            className="text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper) underline cursor-pointer"
          >
            {showDetails ? 'Less details' : 'More details'}
          </button>

          {onPracticeSingle && (
            <button
              type="button"
              onClick={() => onPracticeSingle(word.id)}
              className="px-2.5 py-1 rounded-lg border border-(--color-gold)/40 bg-(--color-gold-soft)/30 dark:bg-(--color-gold)/10 text-(--color-gold) hover:bg-(--color-gold-soft)/50 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Practice</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
