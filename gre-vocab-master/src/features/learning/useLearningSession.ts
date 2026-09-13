import { useCallback, useMemo, useRef, useState } from 'react';
import { useAppStore, words } from '@/store/useAppStore';
import type { ReviewRating, Word } from '@/core/types';

type Phase = 'prompt' | 'revealed' | 'complete';

const MAX_DUE_PER_SESSION = 50;

export function useLearningSession() {
  const dueWords = useAppStore((s) => s.dueWords);
  const newWords = useAppStore((s) => s.newWords);
  const progress = useAppStore((s) => s.progress);
  const reviewWord = useAppStore((s) => s.reviewWord);

  // Snapshot the queue once, at session start, so it doesn't shift mid-session.
  const [queue] = useState<Word[]>(() => {
    const due = dueWords().slice(0, MAX_DUE_PER_SESSION);
    const dueIds = new Set(due.map((w) => w.id));
    const remainingGoal = Math.max(0, progress.dailyGoal - progress.newWordsToday);
    const fresh = newWords(remainingGoal).filter((w) => !dueIds.has(w.id));
    return [...due, ...fresh];
  });

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(queue.length > 0 ? 'prompt' : 'complete');
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const promptShownAt = useRef<number>(Date.now());

  const currentWord = queue[index] as Word | undefined;
  const total = queue.length;

  const reveal = useCallback(() => {
    if (phase === 'prompt') setPhase('revealed');
  }, [phase]);

  const rate = useCallback(
    (rating: ReviewRating) => {
      if (!currentWord || phase !== 'revealed') return;
      const responseTimeMs = Date.now() - promptShownAt.current;
      reviewWord(currentWord.id, rating, responseTimeMs);

      const xpGain = { again: 2, hard: 5, good: 8, easy: 10 }[rating];
      setSessionXp((xp) => xp + xpGain);
      if (rating !== 'again') setSessionCorrect((c) => c + 1);

      const nextIndex = index + 1;
      if (nextIndex >= queue.length) {
        setPhase('complete');
      } else {
        setIndex(nextIndex);
        setPhase('prompt');
        promptShownAt.current = Date.now();
      }
    },
    [currentWord, phase, index, queue.length, reviewWord],
  );

  const progressFraction = total > 0 ? index / total : 1;

  return useMemo(
    () => ({
      currentWord,
      phase,
      index,
      total,
      progressFraction,
      sessionXp,
      sessionCorrect,
      reveal,
      rate,
    }),
    [currentWord, phase, index, total, progressFraction, sessionXp, sessionCorrect, reveal, rate],
  );
}

export { words };
