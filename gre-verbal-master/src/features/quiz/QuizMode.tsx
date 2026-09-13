import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useQuizSession, type QuizSource } from './useQuizSession';
import { QuizSetup } from './QuizSetup';
import { QuizItemView } from './QuizItemView';
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
    startWithItems,
    currentItem,
    answer,
    selectTCBlank,
    toggleSEChoice,
    toggleRCChoice,
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

      {(phase === 'attempt' || phase === 'graded') && currentItem && (
        <QuizItemView
          item={currentItem}
          phase={phase}
          answer={answer}
          onSelectTCBlank={selectTCBlank}
          onToggleSEChoice={toggleSEChoice}
          onToggleRCChoice={toggleRCChoice}
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
          onRetakeMissed={() => startWithItems(missed.map((m) => m.item))}
          onNewQuiz={restart}
          onExit={onExit}
        />
      )}
    </div>
  );
}
