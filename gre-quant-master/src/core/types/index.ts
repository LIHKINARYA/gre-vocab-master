// ── Quant domain ─────────────────────────────────────────────────────

export type ProblemTopic = 'arithmetic' | 'algebra' | 'geometry' | 'data-analysis' | 'word-problems';

export type ProblemType = 'multiple-choice' | 'quant-comparison' | 'numeric-entry';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ProblemChoice {
  id: string;
  text: string;
}

export interface Problem {
  id: string;
  topic: ProblemTopic;
  subtopic: string;
  difficulty: Difficulty;
  type: ProblemType;
  prompt: string;
  /** Quantitative Comparison only */
  quantityA?: string;
  quantityB?: string;
  correctComparison?: 'A' | 'B' | 'equal' | 'cannot-determine';
  /** Multiple choice only */
  choices?: ProblemChoice[];
  correctChoiceId?: string;
  /** Numeric entry only */
  correctValue?: number;
  tolerance?: number;
  unit?: string;
  /** Shared */
  solutionSteps: string[];
  formula?: string;
  estimatedSeconds: number;
  /** Marks a problem as part of the curated 155–160 score-band challenge set */
  challengeSet?: boolean;
}

// ── Spaced repetition (SM-2 style) ──────────────────────────────────

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewEvent {
  timestamp: number;
  rating: ReviewRating;
  responseTimeMs: number;
  wasCorrect: boolean;
}

export interface CardState {
  problemId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lastReviewed: number | null;
  nextReview: number;
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
  lastStudyDate: string | null;
  dailyGoal: number; // new problems/day
  testDate: string | null;
  totalReviewsToday: number;
  newProblemsToday: number;
  lastActivityDate: string | null;
  achievements: string[];
  theme: 'light' | 'dark';
  quizzesCompleted: number;
}

export interface DailyStat {
  date: string;
  reviews: number;
  correct: number;
  incorrect: number;
  newProblemsSolved: number;
  studyTimeMs: number;
}

// ── Aggregate app state persisted to storage ────────────────────────

export interface AppState {
  cards: Record<string, CardState>; // keyed by problemId
  progress: UserProgress;
  dailyStats: Record<string, DailyStat>; // keyed by ISO date
}
