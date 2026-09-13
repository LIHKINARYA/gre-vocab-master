export interface AchievementStats {
  wordsLearned: number;
  wordsMastered: number;
  currentStreak: number;
  longestStreak: number;
  totalReviews: number;
  accuracy: number; // 0-100
  level: number;
  quizzesCompleted: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // a short emoji/glyph, kept simple to match the app's restrained style
  check: (stats: AchievementStats) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-word',
    title: 'First Entry',
    description: 'Learn your first word',
    icon: '✎',
    check: (s) => s.wordsLearned >= 1,
  },
  {
    id: 'words-25',
    title: 'Building the Ledger',
    description: 'Learn 25 words',
    icon: '📖',
    check: (s) => s.wordsLearned >= 25,
  },
  {
    id: 'words-50',
    title: 'Half the Bank',
    description: 'Learn 50 words',
    icon: '📚',
    check: (s) => s.wordsLearned >= 50,
  },
  {
    id: 'words-100',
    title: 'Full Ledger',
    description: 'Learn every word in the bank',
    icon: '🗂',
    check: (s) => s.wordsLearned >= 100,
  },
  {
    id: 'mastered-10',
    title: 'Mastery Streak',
    description: 'Master 10 words',
    icon: '★',
    check: (s) => s.wordsMastered >= 10,
  },
  {
    id: 'mastered-30',
    title: 'Field Expert',
    description: 'Master 30 words',
    icon: '🏅',
    check: (s) => s.wordsMastered >= 30,
  },
  {
    id: 'streak-3',
    title: 'Three in a Row',
    description: 'Study 3 days in a row',
    icon: '🔥',
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'One Week Strong',
    description: 'Study 7 days in a row',
    icon: '🔥',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'streak-14',
    title: 'Fortnight Focus',
    description: 'Study 14 days in a row',
    icon: '🔥',
    check: (s) => s.currentStreak >= 14,
  },
  {
    id: 'reviews-100',
    title: 'Century of Reviews',
    description: 'Complete 100 reviews',
    icon: '🧮',
    check: (s) => s.totalReviews >= 100,
  },
  {
    id: 'reviews-500',
    title: 'Deep Practice',
    description: 'Complete 500 reviews',
    icon: '🧮',
    check: (s) => s.totalReviews >= 500,
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    description: 'Reach 90% accuracy with at least 50 reviews',
    icon: '🎯',
    check: (s) => s.accuracy >= 90 && s.totalReviews >= 50,
  },
  {
    id: 'level-5',
    title: 'Level 5',
    description: 'Reach level 5',
    icon: '⬆',
    check: (s) => s.level >= 5,
  },
  {
    id: 'level-10',
    title: 'Level 10',
    description: 'Reach level 10',
    icon: '⬆',
    check: (s) => s.level >= 10,
  },
  {
    id: 'first-quiz',
    title: 'Put to the Test',
    description: 'Complete your first quiz',
    icon: '📝',
    check: (s) => s.quizzesCompleted >= 1,
  },
  {
    id: 'quizzes-10',
    title: 'Quiz Regular',
    description: 'Complete 10 quizzes',
    icon: '📝',
    check: (s) => s.quizzesCompleted >= 10,
  },
];

/** Returns the ids of every achievement satisfied by the given stats. */
export function evaluateAchievements(stats: AchievementStats): string[] {
  return achievements.filter((a) => a.check(stats)).map((a) => a.id);
}
