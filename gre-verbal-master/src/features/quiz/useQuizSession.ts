import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore, items } from '@/store/useAppStore';
import { gradeItem, isAnswerComplete, emptyAnswer, type ItemAnswer, type TCAnswer, type SEAnswer, type RCAnswer } from '@/core/grading';
import { isStruggling } from '@/core/srs/sm2';
import type { CardState, VerbalItem, VerbalTopic } from '@/core/types';

export type QuizSource = 'due' | 'struggling' | 'all' | VerbalTopic;

type Phase = 'setup' | 'attempt' | 'graded' | 'complete';

export interface QuizConfig {
  source: QuizSource;
  count: number;
  timed: boolean;
}

export interface MissedItem {
  item: VerbalItem;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Groups consecutive same-passage RC questions together so the reader isn't
 * re-orienting to a new passage every single question. */
function groupByPassage(list: VerbalItem[]): VerbalItem[] {
  const seen = new Set<string>();
  const result: VerbalItem[] = [];
  for (const it of list) {
    if (seen.has(it.id)) continue;
    result.push(it);
    seen.add(it.id);
    if (it.type === 'reading-comprehension') {
      for (const other of list) {
        if (other.type === 'reading-comprehension' && other.passageId === it.passageId && !seen.has(other.id)) {
          result.push(other);
          seen.add(other.id);
        }
      }
    }
  }
  return result;
}

function poolForSource(source: QuizSource, cards: Record<string, CardState>, now = Date.now()): VerbalItem[] {
  if (source === 'due') return items.filter((i) => cards[i.id] && cards[i.id].nextReview <= now);
  if (source === 'struggling') return items.filter((i) => cards[i.id] && isStruggling(cards[i.id]));
  if (source === 'all') return items;
  return items.filter((i) => i.topic === source);
}

export function sourceCount(source: QuizSource, cards: Record<string, CardState>): number {
  return poolForSource(source, cards).length;
}

export function useQuizSession(initialSource?: QuizSource) {
  const cards = useAppStore((s) => s.cards);
  const reviewItem = useAppStore((s) => s.reviewItem);
  const recordQuizCompleted = useAppStore((s) => s.recordQuizCompleted);

  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<QuizConfig>({
    source: initialSource ?? 'all',
    count: 20,
    timed: true,
  });
  const [queue, setQueue] = useState<VerbalItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<ItemAnswer>({ choiceIds: [] });
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<MissedItem[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const questionShownAt = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const availableCount = sourceCount(config.source, cards);

  const beginQueue = useCallback((built: VerbalItem[], timed: boolean) => {
    const grouped = groupByPassage(built);
    setQueue(grouped);
    setIndex(0);
    setAnswer(grouped[0] ? emptyAnswer(grouped[0]) : { choiceIds: [] });
    setWasCorrect(null);
    setCorrectCount(0);
    setMissed([]);
    questionShownAt.current = Date.now();
    if (timed) {
      const totalSeconds = grouped.reduce((sum, i) => sum + i.estimatedSeconds, 0);
      setSecondsLeft(totalSeconds);
    }
    setPhase(grouped.length > 0 ? 'attempt' : 'complete');
  }, []);

  const start = useCallback(() => {
    const pool = poolForSource(config.source, cards);
    const built = shuffle(pool).slice(0, config.count);
    beginQueue(built, config.timed);
  }, [config, cards, beginQueue]);

  const startWithItems = useCallback(
    (itemList: VerbalItem[]) => {
      beginQueue(itemList, false);
    },
    [beginQueue],
  );

  const finish = useCallback(() => {
    setPhase('complete');
    recordQuizCompleted();
  }, [recordQuizCompleted]);

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

  const currentItem = queue[index];

  const selectTCBlank = useCallback((blankId: string, choiceId: string) => {
    setAnswer((prev) => ({ blankChoiceIds: { ...(prev as TCAnswer).blankChoiceIds, [blankId]: choiceId } }));
  }, []);

  const toggleSEChoice = useCallback((choiceId: string) => {
    setAnswer((prev) => {
      const a = prev as SEAnswer;
      if (a.choiceIds.includes(choiceId)) return { choiceIds: a.choiceIds.filter((id) => id !== choiceId) };
      if (a.choiceIds.length >= 2) return a;
      return { choiceIds: [...a.choiceIds, choiceId] };
    });
  }, []);

  const toggleRCChoice = useCallback(
    (choiceId: string) => {
      if (!currentItem || currentItem.type !== 'reading-comprehension') return;
      setAnswer((prev) => {
        const a = prev as RCAnswer;
        if (currentItem.questionType === 'single') return { choiceIds: [choiceId] };
        if (a.choiceIds.includes(choiceId)) return { choiceIds: a.choiceIds.filter((id) => id !== choiceId) };
        return { choiceIds: [...a.choiceIds, choiceId] };
      });
    },
    [currentItem],
  );

  const canSubmit = !!currentItem && isAnswerComplete(currentItem, answer);

  const submitAnswer = useCallback(() => {
    if (!currentItem || phase !== 'attempt' || !canSubmit) return;
    const correct = gradeItem(currentItem, answer);
    const responseTimeMs = Date.now() - questionShownAt.current;
    setWasCorrect(correct);
    setPhase('graded');

    if (correct) setCorrectCount((c) => c + 1);
    else setMissed((m) => [...m, { item: currentItem }]);

    reviewItem(currentItem.id, correct ? 'good' : 'again', responseTimeMs, correct);
  }, [currentItem, phase, canSubmit, answer, reviewItem]);

  const next = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      finish();
    } else {
      const nextItem = queue[nextIndex];
      setIndex(nextIndex);
      setAnswer(emptyAnswer(nextItem));
      setWasCorrect(null);
      questionShownAt.current = Date.now();
      setPhase('attempt');
    }
  }, [index, queue, finish]);

  const restart = useCallback(() => setPhase('setup'), []);

  return {
    phase,
    config,
    setConfig,
    availableCount,
    start,
    startWithItems,
    queue,
    index,
    total: queue.length,
    currentItem,
    answer,
    selectTCBlank,
    toggleSEChoice,
    toggleRCChoice,
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
