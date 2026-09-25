export type Rating = 0 | 1 | 2 | 3;

export interface SchedulingState {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SchedulingResult extends SchedulingState {
  nextReviewAt: Date;
}

/**
 * SuperMemo-2 lite.
 * Ratings: 0 = forgot, 1 = hard, 2 = good, 3 = easy
 */
export function scheduleNextReview(
  state: SchedulingState,
  rating: Rating
): SchedulingResult {
  let { easeFactor, interval, repetitions } = state;

  if (rating === 0) {
    // Forgot — reset progress
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Adjust ease factor based on how hard the user found it
    easeFactor = easeFactor + (0.1 - (3 - rating) * 0.08);
    easeFactor = Math.max(1.3, easeFactor);
  }

  const nextReviewAt = new Date(
    Date.now() + interval * 24 * 60 * 60 * 1000
  );

  return { easeFactor, interval, repetitions, nextReviewAt };
}