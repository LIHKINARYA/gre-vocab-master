export interface StudyPlan {
  daysRemaining: number;
  problemsRemaining: number;
  problemsIntroduced: number;
  problemsMastered: number;
  newProblemsPerDay: number;
  reviewsDueToday: number;
  strugglingCount: number;
  recommendedDailyGoal: number;
  onTrack: boolean;
  paceLabel: 'comfortable' | 'moderate' | 'aggressive' | 'review-only';
  progressPercent: number;
}

export function computeStudyPlan(params: {
  testDate: string | null;
  totalProblems: number;
  problemsIntroduced: number;
  problemsMastered: number;
  reviewsDueToday: number;
  strugglingCount: number;
  today?: Date;
}): StudyPlan | null {
  if (!params.testDate) return null;

  const today = params.today ?? new Date();
  today.setHours(0, 0, 0, 0);
  const test = new Date(params.testDate + 'T00:00:00');
  const daysRemaining = Math.max(0, Math.ceil((test.getTime() - today.getTime()) / 86400000));

  const problemsRemaining = Math.max(0, params.totalProblems - params.problemsIntroduced);
  const newProblemsPerDay =
    daysRemaining > 0 ? Math.ceil(problemsRemaining / daysRemaining) : problemsRemaining;

  const recommendedDailyGoal = Math.max(1, newProblemsPerDay);

  let paceLabel: StudyPlan['paceLabel'];
  if (problemsRemaining === 0) paceLabel = 'review-only';
  else if (newProblemsPerDay <= 8) paceLabel = 'comfortable';
  else if (newProblemsPerDay <= 16) paceLabel = 'moderate';
  else paceLabel = 'aggressive';

  const progressPercent =
    params.totalProblems > 0 ? Math.round((params.problemsIntroduced / params.totalProblems) * 100) : 0;

  const onTrack =
    problemsRemaining === 0 ||
    (daysRemaining > 0 &&
      params.problemsIntroduced + daysRemaining * recommendedDailyGoal >= params.totalProblems);

  return {
    daysRemaining,
    problemsRemaining,
    problemsIntroduced: params.problemsIntroduced,
    problemsMastered: params.problemsMastered,
    newProblemsPerDay,
    reviewsDueToday: params.reviewsDueToday,
    strugglingCount: params.strugglingCount,
    recommendedDailyGoal,
    onTrack,
    paceLabel,
    progressPercent,
  };
}
