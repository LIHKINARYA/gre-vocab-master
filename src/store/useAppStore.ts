import { create } from 'zustand';
import { storage } from '@/core/storage/StorageAdapter';
import { computeStudyPlan } from '@/core/planning/studyPlan';
import { createInitialCardState, scheduleNext, isDue, checkMastery, isStruggling } from '@/core/srs/sm2';
import type { AppState, CardState, ReviewRating, UserProgress } from '@/core/types';
import wordsData from '@/data/words.json';
import type { Word } from '@/core/types';

const STORAGE_KEY = 'app-state';

const words = wordsData as Word[];

function todayISO(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function defaultTestDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function recommendedDailyGoal(cards: Record<string, CardState>, testDate: string | null): number {
  const plan = computeStudyPlan({
    testDate,
    totalWords: words.length,
    wordsIntroduced: Object.keys(cards).length,
    wordsMastered: Object.values(cards).filter(checkMastery).length,
    reviewsDueToday: Object.values(cards).filter((c) => c.nextReview <= Date.now()).length,
    strugglingCount: Object.values(cards).filter(isStruggling).length,
  });
  return plan?.recommendedDailyGoal ?? 20;
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  dailyGoal: 20,
  testDate: defaultTestDate(),
  totalReviewsToday: 0,
  newWordsToday: 0,
  lastActivityDate: null,
  achievements: [],
  theme: 'light',
  quizzesCompleted: 0,
};

function xpForRating(rating: ReviewRating): number {
  return { again: 2, hard: 5, good: 8, easy: 10 }[rating];
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
  getWord: (id: string) => Word | undefined;
  getCard: (id: string) => CardState;
  dueWords: (now?: number) => Word[];
  newWords: (limit?: number) => Word[];

  // Actions
  reviewWord: (wordId: string, rating: ReviewRating, responseTimeMs: number) => void;
  toggleBookmark: (wordId: string) => void;
  toggleFavorite: (wordId: string) => void;
  toggleMastered: (wordId: string) => void;
  setPersonalNotes: (wordId: string, notes: string) => void;
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
      const cards: Record<string, CardState> = {};
      for (const [id, c] of Object.entries(saved.cards || {})) {
        cards[id] = {
          ...c,
          mastered: checkMastery(c),
        };
      }
      const progress: UserProgress = {
        ...defaultProgress,
        ...saved.progress,
        testDate: saved.progress.testDate ?? defaultTestDate(),
      };
      set({ cards, progress, dailyStats: saved.dailyStats, hydrated: true });
    } else {
      set({ hydrated: true });
    }
    get().persist();
  },

  persist: async () => {
    const { cards, progress, dailyStats } = get();
    await storage.set(STORAGE_KEY, { cards, progress, dailyStats });
  },

  getWord: (id) => words.find((w) => w.id === id),

  getCard: (id) => {
    const existing = get().cards[id];
    return existing ?? createInitialCardState(id);
  },

  dueWords: (now = Date.now()) => {
    const { cards } = get();
    return words.filter((w) => {
      const card = cards[w.id];
      return card ? isDue(card, now) : false; // only previously-seen words are "due"
    });
  },

  newWords: (limit) => {
    const { cards } = get();
    const fresh = words.filter((w) => !cards[w.id]);
    return typeof limit === 'number' ? fresh.slice(0, limit) : fresh;
  },

  reviewWord: (wordId, rating, responseTimeMs) => {
    const now = Date.now();
    const today = todayISO();
    set((state) => {
      const prevCard = state.cards[wordId] ?? createInitialCardState(wordId);
      const isNewCard = !state.cards[wordId];
      const nextCard = scheduleNext(prevCard, rating, responseTimeMs, now);

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
        newWordsLearned: 0,
        studyTimeMs: 0,
      };
      const dailyStats = {
        ...state.dailyStats,
        [today]: {
          ...prevStat,
          reviews: prevStat.reviews + 1,
          correct: prevStat.correct + (rating === 'again' ? 0 : 1),
          incorrect: prevStat.incorrect + (rating === 'again' ? 1 : 0),
          newWordsLearned: prevStat.newWordsLearned + (isNewCard ? 1 : 0),
          studyTimeMs: prevStat.studyTimeMs + responseTimeMs,
        },
      };

      return {
        cards: { ...state.cards, [wordId]: nextCard },
        progress: {
          ...state.progress,
          xp,
          level,
          currentStreak,
          longestStreak,
          lastStudyDate,
          totalReviewsToday: prevStat.reviews + 1,
          newWordsToday: prevStat.newWordsLearned + (isNewCard ? 1 : 0),
          lastActivityDate: today,
        },
        dailyStats,
      };
    });
    get().persist();
  },

  toggleBookmark: (wordId) => {
    set((state) => {
      const card = state.cards[wordId] ?? createInitialCardState(wordId);
      return { cards: { ...state.cards, [wordId]: { ...card, bookmarked: !card.bookmarked } } };
    });
    get().persist();
  },

  toggleFavorite: (wordId) => {
    set((state) => {
      const card = state.cards[wordId] ?? createInitialCardState(wordId);
      return { cards: { ...state.cards, [wordId]: { ...card, favorite: !card.favorite } } };
    });
    get().persist();
  },

  toggleMastered: (wordId) => {
    set((state) => {
      const card = state.cards[wordId] ?? createInitialCardState(wordId);
      const isCurrentlyMastered = checkMastery(card);
      const willBeMastered = !isCurrentlyMastered;
      const updatedCard: CardState = {
        ...card,
        mastered: willBeMastered,
        repetitions: willBeMastered ? Math.max(card.repetitions, 4) : 1,
        easeFactor: willBeMastered ? Math.max(card.easeFactor, 2.5) : card.easeFactor,
        intervalDays: willBeMastered ? Math.max(card.intervalDays, 14) : card.intervalDays,
      };
      return { cards: { ...state.cards, [wordId]: updatedCard } };
    });
    get().persist();
  },

  setPersonalNotes: (wordId, notes) => {
    set((state) => {
      const card = state.cards[wordId] ?? createInitialCardState(wordId);
      return { cards: { ...state.cards, [wordId]: { ...card, personalNotes: notes } } };
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

export { words };
