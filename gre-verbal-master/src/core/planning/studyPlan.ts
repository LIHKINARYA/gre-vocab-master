export interface StudyPlan {
  daysRemaining: number;
  itemsRemaining: number;
  itemsIntroduced: number;
  itemsMastered: number;
  newItemsPerDay: number;
  reviewsDueToday: number;
  strugglingCount: number;
  recommendedDailyGoal: number;
  onTrack: boolean;
  paceLabel: 'comfortable' | 'moderate' | 'aggressive' | 'review-only';
  progressPercent: number;
}

export function computeStudyPlan(params: {
  testDate: string | null;
  totalItems: number;
  itemsIntroduced: number;
  itemsMastered: number;
  reviewsDueToday: number;
  strugglingCount: number;
  today?: Date;
}): StudyPlan | null {
  if (!params.testDate) return null;

  const today = params.today ?? new Date();
  today.setHours(0, 0, 0, 0);
  const test = new Date(params.testDate + 'T00:00:00');
  const daysRemaining = Math.max(0, Math.ceil((test.getTime() - today.getTime()) / 86400000));

  const itemsRemaining = Math.max(0, params.totalItems - params.itemsIntroduced);
  const newItemsPerDay = daysRemaining > 0 ? Math.ceil(itemsRemaining / daysRemaining) : itemsRemaining;
  const recommendedDailyGoal = Math.max(1, newItemsPerDay);

  let paceLabel: StudyPlan['paceLabel'];
  if (itemsRemaining === 0) paceLabel = 'review-only';
  else if (newItemsPerDay <= 8) paceLabel = 'comfortable';
  else if (newItemsPerDay <= 16) paceLabel = 'moderate';
  else paceLabel = 'aggressive';

  const progressPercent = params.totalItems > 0 ? Math.round((params.itemsIntroduced / params.totalItems) * 100) : 0;

  const onTrack =
    itemsRemaining === 0 ||
    (daysRemaining > 0 && params.itemsIntroduced + daysRemaining * recommendedDailyGoal >= params.totalItems);

  return {
    daysRemaining,
    itemsRemaining,
    itemsIntroduced: params.itemsIntroduced,
    itemsMastered: params.itemsMastered,
    newItemsPerDay,
    reviewsDueToday: params.reviewsDueToday,
    strugglingCount: params.strugglingCount,
    recommendedDailyGoal,
    onTrack,
    paceLabel,
    progressPercent,
  };
}
