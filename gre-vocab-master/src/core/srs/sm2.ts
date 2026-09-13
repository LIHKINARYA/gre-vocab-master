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

  // SM-2 quality mapping: again=0, hard=3, good=4, easy=5 (0-5 scale)
  const quality = { again: 0, hard: 3, good: 4, easy: 5 }[rating];

  // Ease factor update (standard SM-2 formula), clamped to a sane floor.
  let easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  let repetitions = card.repetitions;
  let intervalDays: number;

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 10 / (24 * 60); // 10 minutes, expressed as a fraction of a day
  } else if (repetitions === 0) {
    // First successful review — use the spec's fixed onboarding steps.
    repetitions = 1;
    intervalDays = rating === 'hard' ? 1 : rating === 'good' ? 3 : 7;
  } else {
    repetitions += 1;
    intervalDays = Math.round(card.intervalDays * easeFactor * 10) / 10;
    // Nudge intervals for hard/easy so ratings keep meaning something
    // even once a card is past onboarding.
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

/** A word is "struggling" if it's proving hard to retain — low ease factor or repeated misses. */
export function isStruggling(card: CardState): boolean {
  return card.easeFactor <= 1.5 || card.timesIncorrect >= 2;
}

/**
 * A word is genuinely "learned" only once it has survived a spaced,
 * delayed retrieval — not just the first exposure. `repetitions` already
 * tracks consecutive correct (non-"again") reviews, so a single "Hard" (or
 * even "Good"/"Easy") on first sight sets repetitions to 1, which is still
 * the *learning* phase: the word hasn't yet been tested again after time
 * has passed. Only a second successful recall (repetitions >= 2) — and no
 * sign of struggling since — counts as learned. This mirrors how mainstream
 * SRS tools (e.g. Anki) distinguish "learning" cards from "graduated" ones,
 * and matches the testing-effect research it's built on: retrieval after a
 * delay is what demonstrates learning, not a single correct guess.
 */
export function isLearned(card: CardState): boolean {
  return card.repetitions >= 2 && !isStruggling(card);
}

/** Heuristic "mastered" threshold: consistently easy over several reps. */
export function checkMastery(card: CardState): boolean {
  return card.repetitions >= 5 && card.easeFactor >= 2.5 && card.timesIncorrect === 0;
}
