export interface AchievementStats {
  problemsSolved: number;
  problemsMastered: number;
  currentStreak: number;
  longestStreak: number;
  totalReviews: number;
  accuracy: number; // 0-100
  level: number;
  quizzesCompleted: number;
  topicsStarted: number; // out of 5
  totalProblems: number; // size of the full problem bank, for "solve everything" achievements
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: AchievementStats) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-problem',
    title: 'First Solve',
    description: 'Solve your first problem',
    icon: '✎',
    check: (s) => s.problemsSolved >= 1,
  },
  {
    id: 'problems-25',
    title: 'Warming Up',
    description: 'Solve 25 problems',
    icon: '📐',
    check: (s) => s.problemsSolved >= 25,
  },
  {
    id: 'problems-50',
    title: 'Halfway Bank',
    description: 'Solve 50 problems',
    icon: '📊',
    check: (s) => s.problemsSolved >= 50,
  },
  {
    id: 'problems-all',
    title: 'Full Bank',
    description: 'Solve every problem in the bank',
    icon: '🗂',
    check: (s) => s.totalProblems > 0 && s.problemsSolved >= s.totalProblems,
  },
  {
    id: 'all-topics',
    title: 'Well Rounded',
    description: 'Attempt a problem in every topic',
    icon: '🧭',
    check: (s) => s.topicsStarted >= 5,
  },
  {
    id: 'mastered-10',
    title: 'Mastery Streak',
    description: 'Master 10 problems',
    icon: '★',
    check: (s) => s.problemsMastered >= 10,
  },
  {
    id: 'mastered-25',
    title: 'Quant Expert',
    description: 'Master 25 problems',
    icon: '🏅',
    check: (s) => s.problemsMastered >= 25,
  },
  {
    id: 'streak-3',
    title: 'Three in a Row',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'One Week Strong',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'streak-14',
    title: 'Fortnight Focus',
    description: 'Practice 14 days in a row',
    icon: '🔥',
    check: (s) => s.currentStreak >= 14,
  },
  {
    id: 'reviews-100',
    title: 'Century of Reps',
    description: 'Complete 100 problem attempts',
    icon: '🧮',
    check: (s) => s.totalReviews >= 100,
  },
  {
    id: 'reviews-500',
    title: 'Deep Practice',
    description: 'Complete 500 problem attempts',
    icon: '🧮',
    check: (s) => s.totalReviews >= 500,
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    description: 'Reach 90% accuracy with at least 50 attempts',
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
    title: 'Timed & Tested',
    description: 'Complete your first timed quiz',
    icon: '⏱',
    check: (s) => s.quizzesCompleted >= 1,
  },
  {
    id: 'quizzes-10',
    title: 'Quiz Regular',
    description: 'Complete 10 timed quizzes',
    icon: '⏱',
    check: (s) => s.quizzesCompleted >= 10,
  },
];

/** Returns the ids of every achievement satisfied by the given stats. */
export function evaluateAchievements(stats: AchievementStats): string[] {
  return achievements.filter((a) => a.check(stats)).map((a) => a.id);
}
