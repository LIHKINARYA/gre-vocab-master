import { useCallback, useMemo, useState } from 'react';
import { useAppStore, words } from '@/store/useAppStore';
import { buildQuiz, type QuizQuestion, type QuizQuestionType } from '@/core/quiz/quizGenerator';
import { isDue, isLearned, isStruggling } from '@/core/srs/sm2';
import type { CardState, ReviewRating, Word } from '@/core/types';

export type QuizSource = 'due' | 'struggling' | 'learned' | 'new' | 'all';

export interface QuizConfig {
  source: QuizSource;
  mode: QuizQuestionType | 'mixed';
  count: number;
}

type Phase = 'setup' | 'question' | 'answered' | 'complete';

export function sourceWordCount(source: QuizSource, cards: Record<string, CardState>, now = Date.now()): number {
  switch (source) {
    case 'due':
      return words.filter((w) => cards[w.id] && isDue(cards[w.id], now)).length;
    case 'struggling':
      return words.filter((w) => cards[w.id] && isStruggling(cards[w.id])).length;
    case 'learned':
      return words.filter((w) => cards[w.id] && isLearned(cards[w.id])).length;
    case 'new':
      return words.filter((w) => !cards[w.id]).length;
    case 'all':
      return words.length;
    default:
      return 0;
  }
}

function wordsForSource(source: QuizSource, cards: Record<string, CardState>, now = Date.now()): Word[] {
  switch (source) {
    case 'due':
      return words.filter((w) => cards[w.id] && isDue(cards[w.id], now));
    case 'struggling':
      return words.filter((w) => cards[w.id] && isStruggling(cards[w.id]));
    case 'learned':
      return words.filter((w) => cards[w.id] && isLearned(cards[w.id]));
    case 'new':
      return words.filter((w) => !cards[w.id]);
    case 'all':
      return words;
    default:
      return [];
  }
}

export interface MissedItem {
  word: Word;
  question: QuizQuestion;
  chosenOptionId: string;
}

export function useQuizSession(initialConfig?: Partial<QuizConfig>) {
  const cards = useAppStore((s) => s.cards);
  const reviewWord = useAppStore((s) => s.reviewWord);
  const recordQuizCompleted = useAppStore((s) => s.recordQuizCompleted);

  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<QuizConfig>({
    source: initialConfig?.source ?? 'due',
    mode: initialConfig?.mode ?? 'mixed',
    count: initialConfig?.count ?? 15,
  });
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<MissedItem[]>([]);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [questionShownAt, setQuestionShownAt] = useState<number>(() => Date.now());

  const availableCount = useMemo(() => sourceWordCount(config.source, cards), [config.source, cards]);

  const beginQueue = useCallback((built: QuizQuestion[]) => {
    setQueue(built);
    setIndex(0);
    setSelectedOptionId(null);
    setCorrectCount(0);
    setMissed([]);
    setStartedAt(Date.now());
    setQuestionShownAt(Date.now());
    setPhase(built.length > 0 ? 'question' : 'complete');
  }, []);

  const start = useCallback(() => {
    const pool = wordsForSource(config.source, cards);
    const built = buildQuiz(pool.length > 0 ? pool : words, words, config.mode, config.count);
    beginQueue(built);
  }, [config, cards, beginQueue]);

  /** Starts a fresh quiz over an explicit set of words (e.g. "retake missed"). */
  const startWithWords = useCallback(
    (wordList: Word[]) => {
      const built = buildQuiz(wordList, words, config.mode, wordList.length);
      beginQueue(built);
    },
    [config.mode, beginQueue],
  );

  const currentQuestion = queue[index];
  const currentWord = currentQuestion ? words.find((w) => w.id === currentQuestion.wordId) : undefined;

  const answer = useCallback(
    (optionId: string) => {
      if (!currentQuestion || phase !== 'question') return;
      const isCorrect = optionId === currentQuestion.correctOptionId;
      const responseTimeMs = Date.now() - questionShownAt;

      setSelectedOptionId(optionId);
      setPhase('answered');

      if (isCorrect) {
        setCorrectCount((c) => c + 1);
      } else if (currentWord) {
        setMissed((m) => [...m, { word: currentWord, question: currentQuestion, chosenOptionId: optionId }]);
      }

      // Feed the result back into the SRS scheduler so quizzing counts as review.
      const rating: ReviewRating = isCorrect ? (responseTimeMs < 4500 ? 'easy' : 'good') : 'again';
      reviewWord(currentQuestion.wordId, rating, responseTimeMs);
    },
    [currentQuestion, currentWord, phase, questionShownAt, reviewWord],
  );

  const next = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('complete');
      recordQuizCompleted();
    } else {
      setIndex(nextIndex);
      setSelectedOptionId(null);
      setQuestionShownAt(Date.now());
      setPhase('question');
    }
  }, [index, queue.length, recordQuizCompleted]);

  const restart = useCallback(() => {
    setPhase('setup');
  }, []);

  return {
    phase,
    config,
    setConfig,
    availableCount,
    start,
    startWithWords,
    queue,
    index,
    total: queue.length,
    currentQuestion,
    currentWord,
    selectedOptionId,
    answer,
    next,
    correctCount,
    missed,
    elapsedMs: () => Date.now() - startedAt,
    restart,
  };
}
