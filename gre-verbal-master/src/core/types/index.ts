// ── Verbal domain ────────────────────────────────────────────────────

export type VerbalTopic = 'text-completion' | 'sentence-equivalence' | 'reading-comprehension';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ChoiceOption {
  id: string;
  text: string;
}

// ── Text Completion (1, 2, or 3 blanks; each blank graded independently
// but the item as a whole is only "correct" if every blank is correct —
// matching real GRE all-or-nothing scoring) ─────────────────────────

export interface TCBlank {
  id: string; // 'i' | 'ii' | 'iii'
  choices: ChoiceOption[];
  correctChoiceId: string;
}

export interface TextCompletionItem {
  id: string;
  topic: 'text-completion';
  subtopic: string;
  difficulty: Difficulty;
  type: 'text-completion';
  blanksCount: 1 | 2 | 3;
  /** Contains blank markers like (i), (ii), (iii) inline where each blank sits */
  passageText: string;
  blanks: TCBlank[];
  solutionSteps: string[];
  /** Vocab words (from GRE Vocabulary Master) used as answer choices, for cross-study */
  vocabWordIds?: string[];
  estimatedSeconds: number;
}

// ── Sentence Equivalence (one blank, 6 choices, exactly 2 correct —
// both must produce sentences with equivalent meaning) ──────────────

export interface SentenceEquivalenceItem {
  id: string;
  topic: 'sentence-equivalence';
  subtopic: string;
  difficulty: Difficulty;
  type: 'sentence-equivalence';
  /** Contains a single blank marker where the blank sits */
  sentenceText: string;
  choices: ChoiceOption[]; // exactly 6
  correctChoiceIds: string[]; // exactly 2
  solutionSteps: string[];
  vocabWordIds?: string[];
  estimatedSeconds: number;
}

// ── Reading Comprehension (a shared passage, each question is its own
// schedulable item referencing the passage) ─────────────────────────

export interface Passage {
  id: string;
  title: string;
  text: string;
  difficulty: Difficulty;
  wordCount: number;
}

export interface ReadingComprehensionItem {
  id: string;
  topic: 'reading-comprehension';
  subtopic: string; // "Main Idea" | "Inference" | "Detail" | "Structure" | "Vocab in Context" | "Author's Tone"
  difficulty: Difficulty;
  type: 'reading-comprehension';
  passageId: string;
  prompt: string;
  questionType: 'single' | 'multi'; // multi = "select all that apply", no partial credit
  choices: ChoiceOption[];
  correctChoiceIds: string[];
  solutionSteps: string[];
  estimatedSeconds: number;
}

export type VerbalItem = TextCompletionItem | SentenceEquivalenceItem | ReadingComprehensionItem;

// ── Vocab cross-reference (subset of GRE Vocabulary Master's word data,
// only for words actually used in this bank's answer choices) ───────

export interface VocabRef {
  id: string;
  word: string;
  meaning: string;
  mnemonic?: string;
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
  itemId: string;
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
  dailyGoal: number; // new items/day
  testDate: string | null;
  totalReviewsToday: number;
  newItemsToday: number;
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
  newItemsSolved: number;
  studyTimeMs: number;
}

export interface AppState {
  cards: Record<string, CardState>; // keyed by itemId
  progress: UserProgress;
  dailyStats: Record<string, DailyStat>;
}
