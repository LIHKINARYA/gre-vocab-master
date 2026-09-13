import { useCallback, useRef, useState } from 'react';
import { useAppStore, items } from '@/store/useAppStore';
import { gradeItem, isAnswerComplete, emptyAnswer, type ItemAnswer, type TCAnswer, type SEAnswer, type RCAnswer } from '@/core/grading';
import type { ReviewRating, VerbalItem } from '@/core/types';

type Phase = 'attempt' | 'graded' | 'complete';

const MAX_DUE_PER_SESSION = 40;

export function useItemSession() {
  const dueItems = useAppStore((s) => s.dueItems);
  const newItems = useAppStore((s) => s.newItems);
  const progress = useAppStore((s) => s.progress);
  const reviewItem = useAppStore((s) => s.reviewItem);

  const [queue] = useState<VerbalItem[]>(() => {
    const due = dueItems().slice(0, MAX_DUE_PER_SESSION);
    const dueIds = new Set(due.map((i) => i.id));
    const remainingGoal = Math.max(0, progress.dailyGoal - progress.newItemsToday);
    const fresh = newItems(remainingGoal).filter((i) => !dueIds.has(i.id));
    return [...due, ...fresh];
  });

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(queue.length > 0 ? 'attempt' : 'complete');
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempted, setSessionAttempted] = useState(0);
  const [answer, setAnswer] = useState<ItemAnswer>(() => (queue[0] ? emptyAnswer(queue[0]) : { choiceIds: [] }));
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const promptShownAt = useRef<number>(Date.now());

  const currentItem = queue[index] as VerbalItem | undefined;
  const total = queue.length;

  const selectTCBlank = useCallback((blankId: string, choiceId: string) => {
    setAnswer((prev) => ({ blankChoiceIds: { ...(prev as TCAnswer).blankChoiceIds, [blankId]: choiceId } }));
  }, []);

  const toggleSEChoice = useCallback((choiceId: string) => {
    setAnswer((prev) => {
      const a = prev as SEAnswer;
      if (a.choiceIds.includes(choiceId)) {
        return { choiceIds: a.choiceIds.filter((id) => id !== choiceId) };
      }
      if (a.choiceIds.length >= 2) return a;
      return { choiceIds: [...a.choiceIds, choiceId] };
    });
  }, []);

  const toggleRCChoice = useCallback(
    (choiceId: string) => {
      if (!currentItem || currentItem.type !== 'reading-comprehension') return;
      setAnswer((prev) => {
        const a = prev as RCAnswer;
        if (currentItem.questionType === 'single') {
          return { choiceIds: [choiceId] };
        }
        if (a.choiceIds.includes(choiceId)) {
          return { choiceIds: a.choiceIds.filter((id) => id !== choiceId) };
        }
        return { choiceIds: [...a.choiceIds, choiceId] };
      });
    },
    [currentItem],
  );

  const canSubmit = !!currentItem && phase === 'attempt' && isAnswerComplete(currentItem, answer);

  const submitAnswer = useCallback(() => {
    if (!currentItem || phase !== 'attempt' || !canSubmit) return;
    const correct = gradeItem(currentItem, answer);
    setWasCorrect(correct);
    setSessionAttempted((n) => n + 1);
    setPhase('graded');

    if (!correct) {
      const responseTimeMs = Date.now() - promptShownAt.current;
      reviewItem(currentItem.id, 'again', responseTimeMs, false);
    }
  }, [currentItem, phase, canSubmit, answer, reviewItem]);

  const advance = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('complete');
    } else {
      const nextItem = queue[nextIndex];
      setIndex(nextIndex);
      setPhase('attempt');
      setAnswer(emptyAnswer(nextItem));
      setWasCorrect(null);
      promptShownAt.current = Date.now();
    }
  }, [index, queue]);

  const rateConfidence = useCallback(
    (rating: ReviewRating) => {
      if (!currentItem || phase !== 'graded' || wasCorrect !== true) return;
      const responseTimeMs = Date.now() - promptShownAt.current;
      reviewItem(currentItem.id, rating, responseTimeMs, true);

      const xpGain = { again: 2, hard: 6, good: 10, easy: 13 }[rating];
      setSessionXp((xp) => xp + xpGain);
      setSessionCorrect((c) => c + 1);
      advance();
    },
    [currentItem, phase, wasCorrect, reviewItem, advance],
  );

  const continueAfterWrong = useCallback(() => {
    if (phase !== 'graded' || wasCorrect !== false) return;
    setSessionXp((xp) => xp + 2);
    advance();
  }, [phase, wasCorrect, advance]);

  const progressFraction = total > 0 ? index / total : 1;

  return {
    currentItem,
    phase,
    index,
    total,
    progressFraction,
    sessionXp,
    sessionCorrect,
    sessionAttempted,
    answer,
    selectTCBlank,
    toggleSEChoice,
    toggleRCChoice,
    canSubmit,
    submitAnswer,
    wasCorrect,
    rateConfidence,
    continueAfterWrong,
  };
}

export { items };
