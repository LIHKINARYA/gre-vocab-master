import type { CardState, ReviewRating } from '@/core/types';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** Fresh scheduling state for a problem that has never been attempted. */
export function createInitialCardState(problemId: string): CardState {
  return {
    problemId,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lastReviewed: null,
    nextReview: Date.now(), // due immediately — it's new
    timesCorrect: 0,
    timesIncorrect: 0,
    history: [],
    bookmarked: false,
    mastered: false,
    favorite: false,
    personalNotes: '',
  };
}

/**
 * SM-2 style scheduler. In Practice Mode the rating comes from a mix of
 * auto-grading (wrong answer → forced "again") and a self-reported
 * confidence rating for correct answers (Hard/Good/Easy), so a "wrong
 * answer" and a "these numbers were on the harder side" review carry
 * different weight even though both can result in a short interval.
 * Fixed short-term steps for onboarding (Again→10m, Hard→1d, Good→3d,
 * Easy→7d), then standard ease-factor growth for later repetitions.
 */
export function scheduleNext(
  card: CardState,
  rating: ReviewRating,
  responseTimeMs: number,
  wasCorrect: boolean,
  now: number = Date.now(),
): CardState {
  // SM-2 quality mapping: again=0, hard=3, good=4, easy=5 (0-5 scale)
  const quality = { again: 0, hard: 3, good: 4, easy: 5 }[rating];

  let easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  let repetitions = card.repetitions;
  let intervalDays: number;

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 10 / (24 * 60); // 10 minutes, expressed as a fraction of a day
  } else if (repetitions === 0) {
    repetitions = 1;
    intervalDays = rating === 'hard' ? 1 : rating === 'good' ? 3 : 7;
  } else {
    repetitions += 1;
    intervalDays = Math.round(card.intervalDays * easeFactor * 10) / 10;
    if (rating === 'hard') intervalDays = Math.max(1, intervalDays * 0.7);
    if (rating === 'easy') intervalDays = intervalDays * 1.3;
  }

  const nextReview = now + intervalDays * DAY;

  const updated: CardState = {
    ...card,
    easeFactor,
    intervalDays,
    repetitions,
    lastReviewed: now,
    nextReview,
    timesCorrect: card.timesCorrect + (wasCorrect ? 1 : 0),
    timesIncorrect: card.timesIncorrect + (wasCorrect ? 0 : 1),
    history: [...card.history, { timestamp: now, rating, responseTimeMs, wasCorrect }],
    mastered: card.mastered,
  };

  return { ...updated, mastered: checkMastery(updated) };
}

/** A card is "due" if its scheduled review time has passed. */
export function isDue(card: CardState, now: number = Date.now()): boolean {
  return card.nextReview <= now;
}

/** Heuristic "mastered" threshold: consistently easy over several reps. */
export function checkMastery(card: CardState): boolean {
  return card.repetitions >= 5 && card.easeFactor >= 2.5 && card.timesIncorrect === 0;
}
