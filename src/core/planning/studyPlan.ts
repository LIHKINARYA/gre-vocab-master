export interface StudyPlan {
  daysRemaining: number;
  wordsRemaining: number;
  wordsIntroduced: number;
  wordsMastered: number;
  newWordsPerDay: number;
  reviewsDueToday: number;
  strugglingCount: number;
  recommendedDailyGoal: number;
  onTrack: boolean;
  paceLabel: 'comfortable' | 'moderate' | 'aggressive' | 'review-only';
  progressPercent: number;
}

export function computeStudyPlan(params: {
  testDate: string | null;
  totalWords: number;
  wordsIntroduced: number;
  wordsMastered: number;
  reviewsDueToday: number;
  strugglingCount: number;
  today?: Date;
}): StudyPlan | null {
  if (!params.testDate) return null;

  const today = params.today ?? new Date();
  today.setHours(0, 0, 0, 0);
  const test = new Date(params.testDate + 'T00:00:00');
  const daysRemaining = Math.max(0, Math.ceil((test.getTime() - today.getTime()) / 86400000));

  const wordsRemaining = Math.max(0, params.totalWords - params.wordsIntroduced);
  const newWordsPerDay =
    daysRemaining > 0 ? Math.ceil(wordsRemaining / daysRemaining) : wordsRemaining;

  const recommendedDailyGoal = Math.max(1, newWordsPerDay);

  let paceLabel: StudyPlan['paceLabel'];
  if (wordsRemaining === 0) paceLabel = 'review-only';
  else if (newWordsPerDay <= 10) paceLabel = 'comfortable';
  else if (newWordsPerDay <= 20) paceLabel = 'moderate';
  else paceLabel = 'aggressive';

  const progressPercent =
    params.totalWords > 0 ? Math.round((params.wordsIntroduced / params.totalWords) * 100) : 0;

  const onTrack =
    wordsRemaining === 0 ||
    (daysRemaining > 0 &&
      params.wordsIntroduced + daysRemaining * recommendedDailyGoal >= params.totalWords);

  return {
    daysRemaining,
    wordsRemaining,
    wordsIntroduced: params.wordsIntroduced,
    wordsMastered: params.wordsMastered,
    newWordsPerDay,
    reviewsDueToday: params.reviewsDueToday,
    strugglingCount: params.strugglingCount,
    recommendedDailyGoal,
    onTrack,
    paceLabel,
    progressPercent,
  };
}
