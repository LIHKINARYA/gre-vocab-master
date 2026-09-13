import { WordCard } from './WordCard';
import { RatingButtons } from './RatingButtons';
import { SessionComplete } from './SessionComplete';
import { useLearningSession } from './useLearningSession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { ReviewRating } from '@/core/types';

interface LearningSessionProps {
  onExit: () => void;
}

export function LearningSession({ onExit }: LearningSessionProps) {
  const { currentWord, phase, index, total, progressFraction, sessionXp, sessionCorrect, reveal, rate } =
    useLearningSession();

  useKeyboardShortcuts(
    {
      Space: () => reveal(),
      '1': () => rate('again' as ReviewRating),
      '2': () => rate('hard' as ReviewRating),
      '3': () => rate('good' as ReviewRating),
      '4': () => rate('easy' as ReviewRating),
      Escape: () => onExit(),
    },
    phase !== 'complete',
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onExit}>
          ← Exit (Esc)
        </Button>
        {phase !== 'complete' && (
          <span className="text-sm text-(--color-slate) font-mono">
            {index + 1} / {total}
          </span>
        )}
      </div>

      {phase !== 'complete' && (
        <div className="mb-6">
          <ProgressBar value={progressFraction} color="var(--color-verdigris)" />
        </div>
      )}

      {phase === 'complete' || !currentWord ? (
        <SessionComplete xpEarned={sessionXp} correct={sessionCorrect} total={total} onDone={onExit} />
      ) : (
        <>
          <WordCard word={currentWord} revealed={phase === 'revealed'} />

          {phase === 'prompt' ? (
            <div className="flex justify-center mt-6">
              <Button onClick={reveal}>Reveal (Space)</Button>
            </div>
          ) : (
            <RatingButtons onRate={rate} />
          )}
        </>
      )}
    </div>
  );
}
