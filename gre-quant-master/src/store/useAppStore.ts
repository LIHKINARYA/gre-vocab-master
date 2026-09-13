import { create } from 'zustand';
import { storage } from '@/core/storage/StorageAdapter';
import { computeStudyPlan } from '@/core/planning/studyPlan';
import { createInitialCardState, scheduleNext, isDue, checkMastery } from '@/core/srs/sm2';
import type { AppState, CardState, ReviewRating, UserProgress } from '@/core/types';
import problemsData from '@/data/problems.json';
import type { Problem } from '@/core/types';

const STORAGE_KEY = 'app-state';

const problems = problemsData as Problem[];

function todayISO(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function defaultTestDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function isStruggling(card: CardState): boolean {
  return card.easeFactor <= 1.5 || card.timesIncorrect >= 2;
}

function recommendedDailyGoal(cards: Record<string, CardState>, testDate: string | null): number {
  const plan = computeStudyPlan({
    testDate,
    totalProblems: problems.length,
    problemsIntroduced: Object.keys(cards).length,
    problemsMastered: Object.values(cards).filter(checkMastery).length,
    reviewsDueToday: Object.values(cards).filter((c) => c.nextReview <= Date.now()).length,
    strugglingCount: Object.values(cards).filter(isStruggling).length,
  });
  return plan?.recommendedDailyGoal ?? 10;
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  dailyGoal: 10,
  testDate: defaultTestDate(),
  totalReviewsToday: 0,
  newProblemsToday: 0,
  lastActivityDate: null,
  achievements: [],
  theme: 'light',
  quizzesCompleted: 0,
};

function xpForRating(rating: ReviewRating): number {
  return { again: 2, hard: 6, good: 10, easy: 13 }[rating];
}

/** Level thresholds grow roughly quadratically — feels fast early, slows later. */
export function xpForLevel(level: number): number {
  return 50 * level * level;
}

interface AppStore extends AppState {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  // Derived helpers
  getProblem: (id: string) => Problem | undefined;
  getCard: (id: string) => CardState;
  dueProblems: (now?: number) => Problem[];
  newProblems: (limit?: number) => Problem[];

  // Actions
  reviewProblem: (
    problemId: string,
    rating: ReviewRating,
    responseTimeMs: number,
    wasCorrect: boolean,
  ) => void;
  toggleBookmark: (problemId: string) => void;
  toggleFavorite: (problemId: string) => void;
  setPersonalNotes: (problemId: string, notes: string) => void;
  setDailyGoal: (goal: number) => void;
  setTestDate: (date: string) => void;
  syncDailyGoalFromPlan: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  recordQuizCompleted: () => void;
  unlockAchievements: (ids: string[]) => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  cards: {},
  progress: defaultProgress,
  dailyStats: {},
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<AppState>(STORAGE_KEY);
    if (saved) {
      const progress: UserProgress = {
        ...defaultProgress,
        ...saved.progress,
        testDate: saved.progress.testDate ?? defaultTestDate(),
      };
      set({ cards: saved.cards, progress, dailyStats: saved.dailyStats, hydrated: true });
    } else {
      set({ hydrated: true });
    }
    get().persist();
  },

  persist: async () => {
    const { cards, progress, dailyStats } = get();
    await storage.set(STORAGE_KEY, { cards, progress, dailyStats });
  },

  getProblem: (id) => problems.find((p) => p.id === id),

  getCard: (id) => {
    const existing = get().cards[id];
    return existing ?? createInitialCardState(id);
  },

  dueProblems: (now = Date.now()) => {
    const { cards } = get();
    return problems.filter((p) => {
      const card = cards[p.id];
      return card ? isDue(card, now) : false; // only previously-attempted problems are "due"
    });
  },

  newProblems: (limit) => {
    const { cards } = get();
    const fresh = problems.filter((p) => !cards[p.id]);
    return typeof limit === 'number' ? fresh.slice(0, limit) : fresh;
  },

  reviewProblem: (problemId, rating, responseTimeMs, wasCorrect) => {
    const now = Date.now();
    const today = todayISO();
    set((state) => {
      const prevCard = state.cards[problemId] ?? createInitialCardState(problemId);
      const isNewCard = !state.cards[problemId];
      const nextCard = scheduleNext(prevCard, rating, responseTimeMs, wasCorrect, now);

      // XP + level
      const xpGain = xpForRating(rating);
      let xp = state.progress.xp + xpGain;
      let level = state.progress.level;
      while (xp >= xpForLevel(level)) level += 1;

      // Streak: increment once per calendar day of activity
      let { currentStreak, longestStreak, lastStudyDate } = state.progress;
      if (lastStudyDate !== today) {
        const yesterday = todayISO(new Date(now - 24 * 60 * 60 * 1000));
        currentStreak = lastStudyDate === yesterday ? currentStreak + 1 : 1;
        longestStreak = Math.max(longestStreak, currentStreak);
        lastStudyDate = today;
      }

      const prevStat = state.dailyStats[today] ?? {
        date: today,
        reviews: 0,
        correct: 0,
        incorrect: 0,
        newProblemsSolved: 0,
        studyTimeMs: 0,
      };
      const dailyStats = {
        ...state.dailyStats,
        [today]: {
          ...prevStat,
          reviews: prevStat.reviews + 1,
          correct: prevStat.correct + (wasCorrect ? 1 : 0),
          incorrect: prevStat.incorrect + (wasCorrect ? 0 : 1),
          newProblemsSolved: prevStat.newProblemsSolved + (isNewCard ? 1 : 0),
          studyTimeMs: prevStat.studyTimeMs + responseTimeMs,
        },
      };

      return {
        cards: { ...state.cards, [problemId]: nextCard },
        progress: {
          ...state.progress,
          xp,
          level,
          currentStreak,
          longestStreak,
          lastStudyDate,
          totalReviewsToday: prevStat.reviews + 1,
          newProblemsToday: prevStat.newProblemsSolved + (isNewCard ? 1 : 0),
          lastActivityDate: today,
        },
        dailyStats,
      };
    });
    get().persist();
  },

  toggleBookmark: (problemId) => {
    set((state) => {
      const card = state.cards[problemId] ?? createInitialCardState(problemId);
      return { cards: { ...state.cards, [problemId]: { ...card, bookmarked: !card.bookmarked } } };
    });
    get().persist();
  },

  toggleFavorite: (problemId) => {
    set((state) => {
      const card = state.cards[problemId] ?? createInitialCardState(problemId);
      return { cards: { ...state.cards, [problemId]: { ...card, favorite: !card.favorite } } };
    });
    get().persist();
  },

  setPersonalNotes: (problemId, notes) => {
    set((state) => {
      const card = state.cards[problemId] ?? createInitialCardState(problemId);
      return { cards: { ...state.cards, [problemId]: { ...card, personalNotes: notes } } };
    });
    get().persist();
  },

  setDailyGoal: (goal) => {
    set((state) => ({ progress: { ...state.progress, dailyGoal: goal } }));
    get().persist();
  },

  setTestDate: (date) => {
    set((state) => {
      const progress = { ...state.progress, testDate: date };
      const dailyGoal = recommendedDailyGoal(state.cards, date);
      return { progress: { ...progress, dailyGoal } };
    });
    get().persist();
  },

  syncDailyGoalFromPlan: () => {
    const { cards, progress } = get();
    const dailyGoal = recommendedDailyGoal(cards, progress.testDate);
    set((state) => ({ progress: { ...state.progress, dailyGoal } }));
    get().persist();
  },

  setTheme: (theme) => {
    set((state) => ({ progress: { ...state.progress, theme } }));
    get().persist();
  },

  recordQuizCompleted: () => {
    set((state) => ({
      progress: { ...state.progress, quizzesCompleted: state.progress.quizzesCompleted + 1 },
    }));
    get().persist();
  },

  unlockAchievements: (ids) => {
    if (ids.length === 0) return;
    set((state) => {
      const existing = new Set(state.progress.achievements);
      const newlyUnlocked = ids.filter((id) => !existing.has(id));
      if (newlyUnlocked.length === 0) return state;
      return {
        progress: { ...state.progress, achievements: [...state.progress.achievements, ...newlyUnlocked] },
      };
    });
    get().persist();
  },

  resetProgress: () => {
    set({ cards: {}, progress: defaultProgress, dailyStats: {} });
    get().persist();
  },
}));

export { problems };
