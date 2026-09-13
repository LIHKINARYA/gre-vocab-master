import { ProblemPrompt } from './ProblemPrompt';
import { SolutionPanel } from './SolutionPanel';
import { PracticeComplete } from './PracticeComplete';
import { useProblemSession } from './useProblemSession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { ReviewRating } from '@/core/types';

interface PracticeSessionProps {
  onExit: () => void;
}

export function PracticeSession({ onExit }: PracticeSessionProps) {
  const {
    currentProblem,
    phase,
    index,
    total,
    progressFraction,
    sessionXp,
    sessionCorrect,
    selectedChoiceId,
    setSelectedChoiceId,
    selectedComparison,
    setSelectedComparison,
    numericInput,
    setNumericInput,
    canSubmit,
    submitAnswer,
    wasCorrect,
    rateConfidence,
    continueAfterWrong,
  } = useProblemSession();

  useKeyboardShortcuts(
    {
      Enter: () => {
        if (phase === 'attempt' && canSubmit) submitAnswer();
        else if (phase === 'graded' && wasCorrect === false) continueAfterWrong();
        else if (phase === 'graded' && wasCorrect === true) rateConfidence('good' as ReviewRating);
      },
      '1': () => phase === 'attempt' && setSelectedChoiceId(currentProblem?.choices?.[0]?.id ?? ''),
      '2': () => phase === 'attempt' && setSelectedChoiceId(currentProblem?.choices?.[1]?.id ?? ''),
      '3': () => phase === 'attempt' && setSelectedChoiceId(currentProblem?.choices?.[2]?.id ?? ''),
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

      {phase === 'complete' || !currentProblem ? (
        <PracticeComplete xpEarned={sessionXp} correct={sessionCorrect} total={total} onDone={onExit} />
      ) : (
        <>
          <ProblemPrompt
            problem={currentProblem}
            selectedChoiceId={selectedChoiceId}
            setSelectedChoiceId={setSelectedChoiceId}
            selectedComparison={selectedComparison}
            setSelectedComparison={setSelectedComparison}
            numericInput={numericInput}
            setNumericInput={setNumericInput}
            disabled={phase === 'graded'}
            wasCorrect={wasCorrect}
            correctChoiceId={currentProblem.correctChoiceId}
            correctComparison={currentProblem.correctComparison}
            onSubmitViaEnter={canSubmit ? submitAnswer : undefined}
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
              problem={currentProblem}
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
