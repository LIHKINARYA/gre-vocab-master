import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useQuizSession } from './useQuizSession';
import type { QuizSource } from './useQuizSession';
import { QuizSetup } from './QuizSetup';
import { QuizQuestionCard } from './QuizQuestionCard';
import { QuizComplete } from './QuizComplete';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface QuizModeProps {
  onExit: () => void;
  initialSource?: QuizSource;
}

export function QuizMode({ onExit, initialSource }: QuizModeProps) {
  const session = useQuizSession(initialSource ? { source: initialSource } : undefined);
  const {
    phase,
    config,
    setConfig,
    start,
    startWithWords,
    currentQuestion,
    selectedOptionId,
    answer,
    next,
    index,
    total,
    correctCount,
    missed,
    restart,
  } = session;

  useKeyboardShortcuts(
    {
      '1': () => currentQuestion && phase === 'question' && answer(currentQuestion.options[0]?.id ?? ''),
      '2': () => currentQuestion && phase === 'question' && answer(currentQuestion.options[1]?.id ?? ''),
      '3': () => currentQuestion && phase === 'question' && answer(currentQuestion.options[2]?.id ?? ''),
      '4': () => currentQuestion && phase === 'question' && answer(currentQuestion.options[3]?.id ?? ''),
      Enter: () => phase === 'answered' && next(),
      Escape: () => (phase === 'setup' ? onExit() : restart()),
    },
    phase === 'question' || phase === 'answered' || phase === 'setup',
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onExit}>
          ← Exit
        </Button>
        {(phase === 'question' || phase === 'answered') && (
          <span className="text-sm text-(--color-slate) font-mono">
            {index + 1} / {total}
          </span>
        )}
      </div>

      {(phase === 'question' || phase === 'answered') && (
        <div className="mb-6">
          <ProgressBar value={total > 0 ? index / total : 0} color="var(--color-gold)" />
        </div>
      )}

      {phase === 'setup' && <QuizSetup config={config} setConfig={setConfig} onStart={start} />}

      {(phase === 'question' || phase === 'answered') && currentQuestion && (
        <QuizQuestionCard
          question={currentQuestion}
          selectedOptionId={selectedOptionId}
          answered={phase === 'answered'}
          onSelect={answer}
          onNext={next}
          isLast={index + 1 >= total}
        />
      )}

      {phase === 'complete' && (
        <QuizComplete
          correctCount={correctCount}
          total={total}
          missed={missed}
          onRetakeMissed={() => startWithWords(missed.map((m) => m.word))}
          onNewQuiz={restart}
          onExit={onExit}
        />
      )}
    </div>
  );
}
