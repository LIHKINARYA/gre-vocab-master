// ── Vocabulary domain ────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  difficulty: Difficulty;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  mnemonic: string;
  root: string;
  etymology: string;
  exampleSentences: [string, string];
  commonGreUsage: string;
  relatedWords: string[];
  greFrequency: number; // 1 (rare) – 5 (very common)
  tags: string[];
}

// ── Spaced repetition (SM-2 style) ──────────────────────────────────

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewEvent {
  timestamp: number;
  rating: ReviewRating;
  responseTimeMs: number;
}

export interface CardState {
  wordId: string;
  easeFactor: number; // starts at 2.5, SM-2 standard
  intervalDays: number; // current interval, in days (fractional for minutes)
  repetitions: number; // consecutive correct (non-"again") reviews
  lastReviewed: number | null; // epoch ms
  nextReview: number; // epoch ms — due date
  timesCorrect: number;
  timesIncorrect: number;
  history: ReviewEvent[];
  bookmarked: boolean;
  mastered: boolean;
  favorite: boolean;
  personalNotes: string;
}

// ── User progress / gamification ────────────────────────────────────

export interface UserProgress {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null; // ISO date, for streak calculation
  dailyGoal: number; // new words/day
  testDate: string | null; // ISO date — GRE exam date for pace planning
  totalReviewsToday: number;
  newWordsToday: number;
  lastActivityDate: string | null;
  achievements: string[]; // achievement ids unlocked
  theme: 'light' | 'dark';
  quizzesCompleted: number;
}

export interface DailyStat {
  date: string; // ISO date
  reviews: number;
  correct: number;
  incorrect: number;
  newWordsLearned: number;
  studyTimeMs: number;
}

// ── Aggregate app state persisted to storage ────────────────────────

export interface AppState {
  cards: Record<string, CardState>; // keyed by wordId
  progress: UserProgress;
  dailyStats: Record<string, DailyStat>; // keyed by ISO date
}
