export interface AchievementStats {
  itemsSolved: number;
  itemsMastered: number;
  currentStreak: number;
  longestStreak: number;
  totalReviews: number;
  accuracy: number;
  level: number;
  quizzesCompleted: number;
  passagesRead: number;
  typesStarted: number; // out of 3 (TC, SE, RC)
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: AchievementStats) => boolean;
}

export const achievements: Achievement[] = [
  { id: 'first-item', title: 'First Answer', description: 'Answer your first item', icon: '✎', check: (s) => s.itemsSolved >= 1 },
  { id: 'items-25', title: 'Warming Up', description: 'Answer 25 items', icon: '📖', check: (s) => s.itemsSolved >= 25 },
  { id: 'items-50', title: 'Halfway Bank', description: 'Answer 50 items', icon: '📚', check: (s) => s.itemsSolved >= 50 },
  { id: 'items-100', title: 'Century Mark', description: 'Answer 100 items', icon: '🗂', check: (s) => s.itemsSolved >= 100 },
  { id: 'all-types', title: 'Well Rounded', description: 'Attempt Text Completion, Sentence Equivalence, and Reading Comprehension', icon: '🧭', check: (s) => s.typesStarted >= 3 },
  { id: 'mastered-10', title: 'Mastery Streak', description: 'Master 10 items', icon: '★', check: (s) => s.itemsMastered >= 10 },
  { id: 'mastered-25', title: 'Verbal Expert', description: 'Master 25 items', icon: '🏅', check: (s) => s.itemsMastered >= 25 },
  { id: 'streak-3', title: 'Three in a Row', description: 'Practice 3 days in a row', icon: '🔥', check: (s) => s.currentStreak >= 3 },
  { id: 'streak-7', title: 'One Week Strong', description: 'Practice 7 days in a row', icon: '🔥', check: (s) => s.currentStreak >= 7 },
  { id: 'streak-14', title: 'Fortnight Focus', description: 'Practice 14 days in a row', icon: '🔥', check: (s) => s.currentStreak >= 14 },
  { id: 'reviews-100', title: 'Century of Reps', description: 'Complete 100 item attempts', icon: '🧮', check: (s) => s.totalReviews >= 100 },
  { id: 'reviews-500', title: 'Deep Practice', description: 'Complete 500 item attempts', icon: '🧮', check: (s) => s.totalReviews >= 500 },
  { id: 'sharpshooter', title: 'Sharpshooter', description: 'Reach 90% accuracy with at least 50 attempts', icon: '🎯', check: (s) => s.accuracy >= 90 && s.totalReviews >= 50 },
  { id: 'level-5', title: 'Level 5', description: 'Reach level 5', icon: '⬆', check: (s) => s.level >= 5 },
  { id: 'level-10', title: 'Level 10', description: 'Reach level 10', icon: '⬆', check: (s) => s.level >= 10 },
  { id: 'first-quiz', title: 'Timed & Tested', description: 'Complete your first timed quiz', icon: '⏱', check: (s) => s.quizzesCompleted >= 1 },
  { id: 'quizzes-10', title: 'Quiz Regular', description: 'Complete 10 timed quizzes', icon: '⏱', check: (s) => s.quizzesCompleted >= 10 },
  { id: 'well-read', title: 'Well Read', description: 'Answer questions from 10 different passages', icon: '📰', check: (s) => s.passagesRead >= 10 },
];

/** Returns the ids of every achievement satisfied by the given stats. */
export function evaluateAchievements(stats: AchievementStats): string[] {
  return achievements.filter((a) => a.check(stats)).map((a) => a.id);
}
