import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useQuizSession, type QuizSource } from './useQuizSession';
import { QuizSetup } from './QuizSetup';
import { QuizQuestionView } from './QuizQuestionView';
import { QuizComplete } from './QuizComplete';

interface QuizModeProps {
  onExit: () => void;
  initialSource?: QuizSource;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function QuizMode({ onExit, initialSource }: QuizModeProps) {
  const session = useQuizSession(initialSource);
  const {
    phase,
    config,
    setConfig,
    start,
    startWithProblems,
    currentProblem,
    selectedChoiceId,
    setSelectedChoiceId,
    selectedComparison,
    setSelectedComparison,
    numericInput,
    setNumericInput,
    canSubmit,
    submitAnswer,
    wasCorrect,
    next,
    index,
    total,
    correctCount,
    missed,
    secondsLeft,
    restart,
  } = session;

  const lowTime = config.timed && secondsLeft <= 30;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onExit}>
          ← Exit
        </Button>
        <div className="flex items-center gap-3">
          {(phase === 'attempt' || phase === 'graded') && config.timed && (
            <span className={`text-sm font-mono ${lowTime ? 'text-(--color-rust) font-semibold' : 'text-(--color-slate)'}`}>
              ⏱ {formatTime(secondsLeft)}
            </span>
          )}
          {(phase === 'attempt' || phase === 'graded') && (
            <span className="text-sm text-(--color-slate) font-mono">
              {index + 1} / {total}
            </span>
          )}
        </div>
      </div>

      {(phase === 'attempt' || phase === 'graded') && (
        <div className="mb-6">
          <ProgressBar value={total > 0 ? index / total : 0} color="var(--color-gold)" />
        </div>
      )}

      {phase === 'setup' && <QuizSetup config={config} setConfig={setConfig} onStart={start} />}

      {(phase === 'attempt' || phase === 'graded') && currentProblem && (
        <QuizQuestionView
          problem={currentProblem}
          phase={phase}
          selectedChoiceId={selectedChoiceId}
          setSelectedChoiceId={setSelectedChoiceId}
          selectedComparison={selectedComparison}
          setSelectedComparison={setSelectedComparison}
          numericInput={numericInput}
          setNumericInput={setNumericInput}
          canSubmit={canSubmit}
          onSubmit={submitAnswer}
          wasCorrect={wasCorrect}
          onNext={next}
          isLast={index + 1 >= total}
        />
      )}

      {phase === 'complete' && (
        <QuizComplete
          correctCount={correctCount}
          total={total}
          missed={missed}
          onRetakeMissed={() => startWithProblems(missed.map((m) => m.problem))}
          onNewQuiz={restart}
          onExit={onExit}
        />
      )}
    </div>
  );
}
