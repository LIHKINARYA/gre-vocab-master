import type { CardState, ReviewRating } from '@/core/types';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** Fresh scheduling state for a word that has never been reviewed. */
export function createInitialCardState(wordId: string): CardState {
  return {
    wordId,
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
 * SM-2 style scheduler, adapted with fixed short-term steps for "again"/"hard"
 * so the first few reviews feel snappy (per spec: Again→10m, Hard→1d,
 * Good→3d, Easy→7d), then falls back to standard ease-factor growth for
 * subsequent repetitions.
 */
export function scheduleNext(
  card: CardState,
  rating: ReviewRating,
  responseTimeMs: number,
  now: number = Date.now(),
): CardState {
  const isCorrect = rating !== 'again';

  // Ease factor update: allow recovery on 'good' and 'easy' rather than locking cards into low ease
  let easeFactor = card.easeFactor;
  if (rating === 'again') {
    easeFactor = Math.max(1.3, easeFactor - 0.25);
  } else if (rating === 'hard') {
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 'good') {
    // If ease factor was lowered previously, 'good' gradually restores it back towards baseline 2.5
    if (easeFactor < 2.5) {
      easeFactor = Math.min(2.5, easeFactor + 0.08);
    }
  } else if (rating === 'easy') {
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  let repetitions = card.repetitions;
  let intervalDays: number;

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 10 / (24 * 60); // 10 minutes, expressed as a fraction of a day
  } else if (repetitions === 0) {
    // First successful review (or first after lapse)
    repetitions = 1;
    intervalDays = rating === 'hard' ? 1 : rating === 'good' ? 3 : 7;
  } else {
    repetitions += 1;
    const baseInterval = card.intervalDays > 0 ? card.intervalDays : 1;
    intervalDays = Math.round(baseInterval * easeFactor * 10) / 10;
    // Nudge intervals for hard/easy so ratings keep meaning something
    if (rating === 'hard') intervalDays = Math.max(1, intervalDays * 0.7);
    if (rating === 'easy') intervalDays = intervalDays * 1.3;
    intervalDays = Math.max(1, intervalDays);
  }

  const nextReview = now + intervalDays * DAY;

  const updated: CardState = {
    ...card,
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays: Math.round(intervalDays * 10) / 10,
    repetitions,
    lastReviewed: now,
    nextReview,
    timesCorrect: card.timesCorrect + (isCorrect ? 1 : 0),
    timesIncorrect: card.timesIncorrect + (isCorrect ? 0 : 1),
    history: [...card.history, { timestamp: now, rating, responseTimeMs }],
    mastered: card.mastered,
  };

  return { ...updated, mastered: checkMastery(updated) };
}

/** A card is "due" if its scheduled review time has passed. */
export function isDue(card: CardState, now: number = Date.now()): boolean {
  return card.nextReview <= now;
}

/**
 * A word is "struggling" if the user is currently failing to retain it:
 * - Most recent review was 'again' (lapsed, repetitions === 0)
 * - Has low ease or accumulated errors WITHOUT having recovered (repetitions < 2)
 *
 * Once a user reviews a struggling word and answers correctly multiple times
 * (repetitions >= 2 and latest rating was not 'again'), it graduates out of struggling!
 */
export function isStruggling(card: CardState): boolean {
  if (!card.lastReviewed && card.history.length === 0) {
    return false;
  }

  if (card.mastered) {
    return false;
  }

  const lastEvent = card.history.length > 0 ? card.history[card.history.length - 1] : null;
  const lastWasAgain = lastEvent?.rating === 'again';

  // If last review was 'again' or repetitions was reset to 0, it is currently struggling
  if (lastWasAgain || card.repetitions === 0) {
    return true;
  }

  // If the user has achieved 2 or more consecutive correct recalls, they have recovered!
  if (card.repetitions >= 2) {
    return false;
  }

  // While repetitions is still 1 (only 1 correct review after a lapse),
  // card remains in struggling if it had low ease or multiple past mistakes
  if (card.easeFactor <= 1.6 || card.timesIncorrect >= 2) {
    return true;
  }

  return false;
}

/**
 * A word is genuinely "learned" once it has survived a spaced, delayed retrieval
 * (repetitions >= 2) without currently struggling, or has achieved mastery.
 */
export function isLearned(card: CardState): boolean {
  if (checkMastery(card)) return true;
  return card.repetitions >= 2 && !isStruggling(card);
}

/**
 * A word is "mastered" when the user has demonstrated durable, spaced retention:
 * - Explicitly marked mastered: card.mastered === true
 * - OR 4+ consecutive successful recalls (repetitions >= 4) with good ease factor
 * - OR interval is 14+ days with at least 3 successful repetitions
 * - OR 4+ total correct reviews, repetitions >= 3, and easeFactor >= 2.1
 * (Does NOT permanently disqualify cards for having made mistakes in the past!)
 */
export function checkMastery(card: CardState): boolean {
  if (card.mastered) {
    return true;
  }

  if (isStruggling(card)) {
    return false;
  }

  const lastEvent = card.history.length > 0 ? card.history[card.history.length - 1] : null;
  if (lastEvent?.rating === 'again') {
    return false;
  }

  // 4+ consecutive successful reviews with healthy ease
  if (card.repetitions >= 4 && card.easeFactor >= 2.0) {
    return true;
  }

  // Spaced interval of 2+ weeks out with at least 3 successful reviews
  if (card.intervalDays >= 14 && card.repetitions >= 3) {
    return true;
  }

  // 4+ lifetime correct with solid current streak
  if (card.timesCorrect >= 4 && card.repetitions >= 3 && card.easeFactor >= 2.1) {
    return true;
  }

  return false;
}
