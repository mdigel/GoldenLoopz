import { getWeekStart } from './dateUtils';

/**
 * Utility functions for pro-rating goals based on vacation days
 * and first-week onboarding.
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

/**
 * Calculate the number of days before onboarding in a given week.
 * Returns 0 for any week after the onboarding week.
 * @param weekDate - Any date within the week to check
 * @param onboardingDate - The date onboarding was completed (YYYY-MM-DD), or null
 * @returns Number of days in the week before the user started (0-6)
 */
export function getFirstWeekUnavailableDays(weekDate: Date, onboardingDate: string | null): number {
  if (!onboardingDate) return 0;

  const weekStart = getWeekStart(weekDate);
  const onboarding = new Date(onboardingDate + 'T00:00:00');

  // If onboarding was before this week starts, no prorating needed
  if (onboarding <= weekStart) return 0;

  // If onboarding is after this week ends, entire week is unavailable
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  if (onboarding > weekEnd) return 7;

  // Calculate days between week start (Monday) and onboarding date
  const diffMs = onboarding.getTime() - weekStart.getTime();
  const unavailableDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return unavailableDays;
}

/**
 * Get total unavailable days for prorating (vacation + first-week onboarding).
 * @param vacationDays - Number of vacation days in the week
 * @param weekDate - Any date within the week
 * @param onboardingDate - The onboarding completion date (YYYY-MM-DD), or null
 * @returns Total unavailable days (capped at 7)
 */
export function getTotalUnavailableDays(
  vacationDays: number,
  weekDate: Date,
  onboardingDate: string | null
): number {
  const firstWeekDays = getFirstWeekUnavailableDays(weekDate, onboardingDate);
  return Math.min(vacationDays + firstWeekDays, 7);
}
