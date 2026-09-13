import { ItemPrompt } from './ItemPrompt';
import { SolutionPanel } from './SolutionPanel';
import { PracticeComplete } from './PracticeComplete';
import { useItemSession } from './useItemSession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { ReviewRating } from '@/core/types';

interface PracticeSessionProps {
  onExit: () => void;
}

export function PracticeSession({ onExit }: PracticeSessionProps) {
  const {
    currentItem,
    phase,
    index,
    total,
    progressFraction,
    sessionXp,
    sessionCorrect,
    answer,
    selectTCBlank,
    toggleSEChoice,
    toggleRCChoice,
    canSubmit,
    submitAnswer,
    wasCorrect,
    rateConfidence,
    continueAfterWrong,
  } = useItemSession();

  useKeyboardShortcuts(
    {
      Enter: () => {
        if (phase === 'attempt' && canSubmit) submitAnswer();
        else if (phase === 'graded' && wasCorrect === false) continueAfterWrong();
        else if (phase === 'graded' && wasCorrect === true) rateConfidence('good' as ReviewRating);
      },
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

      {phase === 'complete' || !currentItem ? (
        <PracticeComplete xpEarned={sessionXp} correct={sessionCorrect} total={total} onDone={onExit} />
      ) : (
        <>
          <ItemPrompt
            item={currentItem}
            answer={answer}
            disabled={phase === 'graded'}
            onSelectTCBlank={selectTCBlank}
            onToggleSEChoice={toggleSEChoice}
            onToggleRCChoice={toggleRCChoice}
          />

          {phase === 'attempt' && (
            <div className="flex justify-end mt-4">
              <Button onClick={submitAnswer} disabled={!canSubmit}>
                Submit
              </Button>
            </div>
          )}

          {phase === 'graded' && wasCorrect !== null && (
            <SolutionPanel
              item={currentItem}
              wasCorrect={wasCorrect}
              onRateConfidence={rateConfidence}
              onContinue={continueAfterWrong}
            />
          )}
        </>
      )}
    </div>
  );
}
