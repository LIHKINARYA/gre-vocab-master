import type { CardState, ReviewRating } from '@/core/types';

const DAY = 24 * 60 * 60 * 1000;

/** Fresh scheduling state for an item that has never been attempted. */
export function createInitialCardState(itemId: string): CardState {
  return {
    itemId,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lastReviewed: null,
    nextReview: Date.now(),
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
 * confidence rating for correct answers (Hard/Good/Easy).
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
  const quality = { again: 0, hard: 3, good: 4, easy: 5 }[rating];

  let easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  let repetitions = card.repetitions;
  let intervalDays: number;

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 10 / (24 * 60);
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
  };

  return { ...updated, mastered: checkMastery(updated) };
}

export function isDue(card: CardState, now: number = Date.now()): boolean {
  return card.nextReview <= now;
}

/**
 * A card is mastered once it's built up 5 reps at a healthy ease factor.
 * `repetitions` already resets to 0 on any "again" rating (see scheduleNext),
 * so `repetitions >= 5` on its own guarantees 5 consecutive correct reviews
 * since the last miss — there's no need to additionally require
 * `timesIncorrect === 0`. That lifetime count never decreases, so requiring
 * it to stay at 0 would permanently block mastery after a single early
 * mistake, even after the card is later answered correctly many times.
 */
export function checkMastery(card: CardState): boolean {
  return card.repetitions >= 5 && card.easeFactor >= 2.5;
}

/**
 * A card is "struggling" if its ease factor has dropped low, or if its two
 * most recent reviews were both misses. This looks at the tail of `history`
 * rather than the lifetime `timesIncorrect` counter, which only ever goes
 * up — using it directly would mean any card missed twice, ever, stays
 * flagged as struggling forever, even after it's since been answered
 * correctly many times in a row. That's what was making struggling counts
 * across the app only grow (or plateau) instead of reflecting current
 * performance.
 */
export function isStruggling(card: CardState): boolean {
  if (card.easeFactor <= 1.5) return true;
  const recent = card.history.slice(-2);
  return recent.length === 2 && recent.every((h) => !h.wasCorrect);
}
