import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore, problems } from '@/store/useAppStore';
import type { CardState, Problem, ProblemTopic } from '@/core/types';

export type QuizSource = 'due' | 'struggling' | 'challenge' | 'all' | ProblemTopic;

type Comparison = 'A' | 'B' | 'equal' | 'cannot-determine';
type Phase = 'setup' | 'attempt' | 'graded' | 'complete';

export interface QuizConfig {
  source: QuizSource;
  count: number;
  timed: boolean;
}

export interface MissedItem {
  problem: Problem;
  wasCorrect: false;
}

function isStruggling(card: CardState): boolean {
  return card.easeFactor <= 1.5 || card.timesIncorrect >= 2;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function poolForSource(source: QuizSource, cards: Record<string, CardState>, now = Date.now()): Problem[] {
  if (source === 'due') return problems.filter((p) => cards[p.id] && cards[p.id].nextReview <= now);
  if (source === 'struggling') return problems.filter((p) => cards[p.id] && isStruggling(cards[p.id]));
  if (source === 'challenge') return problems.filter((p) => p.challengeSet);
  if (source === 'all') return problems;
  return problems.filter((p) => p.topic === source);
}

export function sourceCount(source: QuizSource, cards: Record<string, CardState>): number {
  return poolForSource(source, cards).length;
}

function gradeAnswer(
  problem: Problem,
  answer: { choiceId?: string; comparison?: Comparison; numericValue?: number },
): boolean {
  if (problem.type === 'multiple-choice') return answer.choiceId === problem.correctChoiceId;
  if (problem.type === 'quant-comparison') return answer.comparison === problem.correctComparison;
  if (problem.type === 'numeric-entry') {
    if (answer.numericValue === undefined || Number.isNaN(answer.numericValue)) return false;
    const tolerance = problem.tolerance ?? 0;
    return Math.abs(answer.numericValue - (problem.correctValue ?? NaN)) <= tolerance + 1e-9;
  }
  return false;
}

export function useQuizSession(initialSource?: QuizSource) {
  const cards = useAppStore((s) => s.cards);
  const reviewProblem = useAppStore((s) => s.reviewProblem);
  const recordQuizCompleted = useAppStore((s) => s.recordQuizCompleted);

  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<QuizConfig>({
    source: initialSource ?? 'all',
    count: 20,
    timed: true,
  });
  const [queue, setQueue] = useState<Problem[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<Comparison | null>(null);
  const [numericInput, setNumericInput] = useState('');
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<MissedItem[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const questionShownAt = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const availableCount = sourceCount(config.source, cards);

  const beginQueue = useCallback(
    (built: Problem[], timed: boolean) => {
      setQueue(built);
      setIndex(0);
      setSelectedChoiceId(null);
      setSelectedComparison(null);
      setNumericInput('');
      setWasCorrect(null);
      setCorrectCount(0);
      setMissed([]);
      questionShownAt.current = Date.now();
      if (timed) {
        const totalSeconds = built.reduce((sum, p) => sum + p.estimatedSeconds, 0);
        setSecondsLeft(totalSeconds);
      }
      setPhase(built.length > 0 ? 'attempt' : 'complete');
    },
    [],
  );

  const start = useCallback(() => {
    const pool = poolForSource(config.source, cards);
    const built = shuffle(pool).slice(0, config.count);
    beginQueue(built, config.timed);
  }, [config, cards, beginQueue]);

  const startWithProblems = useCallback(
    (problemList: Problem[]) => {
      beginQueue(problemList, false);
    },
    [beginQueue],
  );

  const finish = useCallback(() => {
    setPhase('complete');
    recordQuizCompleted();
  }, [recordQuizCompleted]);

  // Countdown timer for timed mode
  useEffect(() => {
    if (phase !== 'attempt' && phase !== 'graded') {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    if (!config.timed) return;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timerRef.current!);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [phase, config.timed, finish]);

  const currentProblem = queue[index];

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
    const responseTimeMs = Date.now() - questionShownAt.current;
    setWasCorrect(correct);
    setPhase('graded');

    if (correct) setCorrectCount((c) => c + 1);
    else setMissed((m) => [...m, { problem: currentProblem, wasCorrect: false }]);

    reviewProblem(currentProblem.id, correct ? 'good' : 'again', responseTimeMs, correct);
  }, [currentProblem, phase, canSubmit, numericInput, selectedChoiceId, selectedComparison, reviewProblem]);

  const next = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      finish();
    } else {
      setIndex(nextIndex);
      setSelectedChoiceId(null);
      setSelectedComparison(null);
      setNumericInput('');
      setWasCorrect(null);
      questionShownAt.current = Date.now();
      setPhase('attempt');
    }
  }, [index, queue.length, finish]);

  const restart = useCallback(() => setPhase('setup'), []);

  return {
    phase,
    config,
    setConfig,
    availableCount,
    start,
    startWithProblems,
    queue,
    index,
    total: queue.length,
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
    correctCount,
    missed,
    secondsLeft,
    restart,
  };
}
