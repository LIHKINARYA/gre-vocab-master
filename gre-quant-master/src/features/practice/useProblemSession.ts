import { useCallback, useRef, useState } from 'react';
import { useAppStore, problems } from '@/store/useAppStore';
import type { Problem, ReviewRating } from '@/core/types';

type Phase = 'attempt' | 'graded' | 'complete';
type Comparison = 'A' | 'B' | 'equal' | 'cannot-determine';

const MAX_DUE_PER_SESSION = 40;

function gradeAnswer(
  problem: Problem,
  answer: { choiceId?: string; comparison?: Comparison; numericValue?: number },
): boolean {
  if (problem.type === 'multiple-choice') {
    return answer.choiceId === problem.correctChoiceId;
  }
  if (problem.type === 'quant-comparison') {
    return answer.comparison === problem.correctComparison;
  }
  if (problem.type === 'numeric-entry') {
    if (answer.numericValue === undefined || Number.isNaN(answer.numericValue)) return false;
    const tolerance = problem.tolerance ?? 0;
    return Math.abs(answer.numericValue - (problem.correctValue ?? NaN)) <= tolerance + 1e-9;
  }
  return false;
}

export function useProblemSession() {
  const dueProblems = useAppStore((s) => s.dueProblems);
  const newProblems = useAppStore((s) => s.newProblems);
  const progress = useAppStore((s) => s.progress);
  const reviewProblem = useAppStore((s) => s.reviewProblem);

  const [queue] = useState<Problem[]>(() => {
    const due = dueProblems().slice(0, MAX_DUE_PER_SESSION);
    const dueIds = new Set(due.map((p) => p.id));
    const remainingGoal = Math.max(0, progress.dailyGoal - progress.newProblemsToday);
    const fresh = newProblems(remainingGoal).filter((p) => !dueIds.has(p.id));
    return [...due, ...fresh];
  });

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(queue.length > 0 ? 'attempt' : 'complete');
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempted, setSessionAttempted] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<Comparison | null>(null);
  const [numericInput, setNumericInput] = useState('');
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const promptShownAt = useRef<number>(Date.now());

  const currentProblem = queue[index] as Problem | undefined;
  const total = queue.length;

  const canSubmit =
    !!currentProblem &&
    ((currentProblem.type === 'multiple-choice' && !!selectedChoiceId) ||
      (currentProblem.type === 'quant-comparison' && !!selectedComparison) ||
      (currentProblem.type === 'numeric-entry' && numericInput.trim() !== ''));

  const submitAnswer = useCallback(() => {
    if (!currentProblem || phase !== 'attempt' || !canSubmit) return;
    const numericValue = numericInput.trim() === '' ? undefined : Number(numericInput);
    const correct = gradeAnswer(currentProblem, {
      choiceId: selectedChoiceId ?? undefined,
      comparison: selectedComparison ?? undefined,
      numericValue,
    });
    setWasCorrect(correct);
    setSessionAttempted((n) => n + 1);
    setPhase('graded');

    if (!correct) {
      // Wrong answers are always scheduled as "again" — no confidence step needed.
      const responseTimeMs = Date.now() - promptShownAt.current;
      reviewProblem(currentProblem.id, 'again', responseTimeMs, false);
    }
  }, [currentProblem, phase, canSubmit, numericInput, selectedChoiceId, selectedComparison, reviewProblem]);

  const advance = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('complete');
    } else {
      setIndex(nextIndex);
      setPhase('attempt');
      setSelectedChoiceId(null);
      setSelectedComparison(null);
      setNumericInput('');
      setWasCorrect(null);
      promptShownAt.current = Date.now();
    }
  }, [index, queue.length]);

  /** Called only when the answer was correct, to record a confidence rating. */
  const rateConfidence = useCallback(
    (rating: ReviewRating) => {
      if (!currentProblem || phase !== 'graded' || wasCorrect !== true) return;
      const responseTimeMs = Date.now() - promptShownAt.current;
      reviewProblem(currentProblem.id, rating, responseTimeMs, true);

      const xpGain = { again: 2, hard: 6, good: 10, easy: 13 }[rating];
      setSessionXp((xp) => xp + xpGain);
      setSessionCorrect((c) => c + 1);
      advance();
    },
    [currentProblem, phase, wasCorrect, reviewProblem, advance],
  );

  /** Called after reviewing the solution to a wrong answer — no rating choice needed. */
  const continueAfterWrong = useCallback(() => {
    if (phase !== 'graded' || wasCorrect !== false) return;
    setSessionXp((xp) => xp + 2);
    advance();
  }, [phase, wasCorrect, advance]);

  const progressFraction = total > 0 ? index / total : 1;

  return {
    currentProblem,
    phase,
    index,
    total,
    progressFraction,
    sessionXp,
    sessionCorrect,
    sessionAttempted,
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
  };
}

export { problems };
