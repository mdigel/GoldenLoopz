/**
 * Utility functions for pro-rating goals based on vacation days.
 * When users take vacation, their weekly goals should be scaled down
 * proportionally so they aren't penalized for time off.
 */

/**
 * Calculate the pro-rating multiplier based on vacation days.
 * @param vacationDays - Number of vacation days in the week
 * @param totalDays - Total days in the week (default 7)
 * @returns A multiplier between 0 and 1
 */
export function getVacationMultiplier(vacationDays: number, totalDays: number = 7): number {
  const workingDays = Math.max(0, totalDays - vacationDays);
  return workingDays / totalDays;
}

/**
 * Pro-rate a weekly goal based on vacation days.
 * @param goal - The original weekly goal value
 * @param vacationDays - Number of vacation days
 * @returns The adjusted goal value
 */
export function proRateGoal(goal: number, vacationDays: number): number {
  const multiplier = getVacationMultiplier(vacationDays);
  return goal * multiplier;
}

/**
 * Calculate progress against a pro-rated goal.
 * @param actual - Actual value achieved
 * @param goal - Original goal (will be pro-rated)
 * @param vacationDays - Number of vacation days
 * @returns Progress as 0-1 ratio, or null if week is all vacation
 */
export function calculateProRatedProgress(
  actual: number,
  goal: number,
  vacationDays: number
): number | null {
  // Edge case: all days are vacation
  if (vacationDays >= 7) {
    return null;
  }

  // Edge case: no goal set
  if (goal <= 0) {
    return 0;
  }

  const adjustedGoal = proRateGoal(goal, vacationDays);

  // Edge case: adjusted goal is 0 (shouldn't happen if vacationDays < 7)
  if (adjustedGoal <= 0) {
    return actual > 0 ? 1 : 0;
  }

  return Math.min(actual / adjustedGoal, 1);
}

/**
 * Check if a week is a full vacation week.
 * A week is considered full vacation if all 7 days are vacation
 * OR if all logged days are vacation (for current/partial weeks).
 */
export function isFullVacationWeek(vacationDays: number, daysLogged: number = 0): boolean {
  return vacationDays >= 7 || (daysLogged > 0 && vacationDays >= daysLogged);
}
