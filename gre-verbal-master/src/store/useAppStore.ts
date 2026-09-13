import { create } from 'zustand';
import { storage } from '@/core/storage/StorageAdapter';
import { computeStudyPlan } from '@/core/planning/studyPlan';
import { createInitialCardState, scheduleNext, isDue, checkMastery, isStruggling } from '@/core/srs/sm2';
import type { AppState, CardState, ReviewRating, UserProgress, VerbalItem, Passage, VocabRef } from '@/core/types';
import itemsData from '@/data/items.json';
import passagesData from '@/data/passages.json';
import vocabRefsData from '@/data/vocabRefs.json';

const STORAGE_KEY = 'app-state';

const items = itemsData as VerbalItem[];
const passages = passagesData as Passage[];
const vocabRefs = vocabRefsData as VocabRef[];

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
    totalItems: items.length,
    itemsIntroduced: Object.keys(cards).length,
    itemsMastered: Object.values(cards).filter(checkMastery).length,
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
  newItemsToday: 0,
  lastActivityDate: null,
  achievements: [],
  theme: 'light',
  quizzesCompleted: 0,
};

function xpForRating(rating: ReviewRating): number {
  return { again: 2, hard: 6, good: 10, easy: 13 }[rating];
}

export function xpForLevel(level: number): number {
  return 50 * level * level;
}

interface AppStore extends AppState {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  getItem: (id: string) => VerbalItem | undefined;
  getPassage: (id: string) => Passage | undefined;
  getCard: (id: string) => CardState;
  dueItems: (now?: number) => VerbalItem[];
  newItems: (limit?: number) => VerbalItem[];

  reviewItem: (itemId: string, rating: ReviewRating, responseTimeMs: number, wasCorrect: boolean) => void;
  toggleBookmark: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
  setPersonalNotes: (itemId: string, notes: string) => void;
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

  getItem: (id) => items.find((i) => i.id === id),
  getPassage: (id) => passages.find((p) => p.id === id),

  getCard: (id) => {
    const existing = get().cards[id];
    return existing ?? createInitialCardState(id);
  },

  dueItems: (now = Date.now()) => {
    const { cards } = get();
    return items.filter((i) => {
      const card = cards[i.id];
      return card ? isDue(card, now) : false;
    });
  },

  newItems: (limit) => {
    const { cards } = get();
    const fresh = items.filter((i) => !cards[i.id]);
    return typeof limit === 'number' ? fresh.slice(0, limit) : fresh;
  },

  reviewItem: (itemId, rating, responseTimeMs, wasCorrect) => {
    const now = Date.now();
    const today = todayISO();
    set((state) => {
      const prevCard = state.cards[itemId] ?? createInitialCardState(itemId);
      const isNewCard = !state.cards[itemId];
      const nextCard = scheduleNext(prevCard, rating, responseTimeMs, wasCorrect, now);

      const xpGain = xpForRating(rating);
      let xp = state.progress.xp + xpGain;
      let level = state.progress.level;
      while (xp >= xpForLevel(level)) level += 1;

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
        newItemsSolved: 0,
        studyTimeMs: 0,
      };
      const dailyStats = {
        ...state.dailyStats,
        [today]: {
          ...prevStat,
          reviews: prevStat.reviews + 1,
          correct: prevStat.correct + (wasCorrect ? 1 : 0),
          incorrect: prevStat.incorrect + (wasCorrect ? 0 : 1),
          newItemsSolved: prevStat.newItemsSolved + (isNewCard ? 1 : 0),
          studyTimeMs: prevStat.studyTimeMs + responseTimeMs,
        },
      };

      return {
        cards: { ...state.cards, [itemId]: nextCard },
        progress: {
          ...state.progress,
          xp,
          level,
          currentStreak,
          longestStreak,
          lastStudyDate,
          totalReviewsToday: prevStat.reviews + 1,
          newItemsToday: prevStat.newItemsSolved + (isNewCard ? 1 : 0),
          lastActivityDate: today,
        },
        dailyStats,
      };
    });
    get().persist();
  },

  toggleBookmark: (itemId) => {
    set((state) => {
      const card = state.cards[itemId] ?? createInitialCardState(itemId);
      return { cards: { ...state.cards, [itemId]: { ...card, bookmarked: !card.bookmarked } } };
    });
    get().persist();
  },

  toggleFavorite: (itemId) => {
    set((state) => {
      const card = state.cards[itemId] ?? createInitialCardState(itemId);
      return { cards: { ...state.cards, [itemId]: { ...card, favorite: !card.favorite } } };
    });
    get().persist();
  },

  setPersonalNotes: (itemId, notes) => {
    set((state) => {
      const card = state.cards[itemId] ?? createInitialCardState(itemId);
      return { cards: { ...state.cards, [itemId]: { ...card, personalNotes: notes } } };
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

export { items, passages, vocabRefs };
