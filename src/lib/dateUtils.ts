// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's date as YYYY-MM-DD
export function getToday(): string {
  return formatDate(new Date());
}

// Parse YYYY-MM-DD string to Date
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Get start of week (Monday)
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get end of week (Sunday)
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// Get all dates in a week
export function getWeekDates(date: Date = new Date()): string[] {
  const start = getWeekStart(date);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

// Get all dates in a month
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(formatDate(new Date(year, month, day)));
  }
  return dates;
}

// Get start of year
export function getYearStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), 0, 1);
}

// Check if two dates are the same day
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  return formatDate(d1) === formatDate(d2);
}

// Check if date is yesterday
export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday) === dateStr;
}

// Get days between two dates
export function daysBetween(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format date for display (e.g., "Monday, Jan 10")
export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

// Format time from minutes to hours and minutes string
export function formatMinutesToDisplay(minutes: number): string {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Convert hours to minutes
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

// Convert minutes to hours
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

// Get week number of year
export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month];
}

// Get short day names
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_NAMES_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Calculate the number of weeks that belong to each month in a given year.
 * A week belongs to the month that contains its Monday (since weeks run Mon-Sun).
 *
 * @param year - The year to calculate for
 * @returns An array of 12 numbers representing weeks per month (index 0 = January)
 */
export function getWeeksPerMonth(year: number): number[] {
  const weeksPerMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Start from the first Monday of the year (or first Monday in January)
  const jan1 = new Date(year, 0, 1);
  let currentMonday = new Date(jan1);
  const dayOfWeek = jan1.getDay();

  // If Jan 1 is not Monday, move forward to the first Monday
  if (dayOfWeek !== 1) {
    const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    currentMonday.setDate(currentMonday.getDate() + daysToAdd);
  }

  // Count weeks by their Monday's month
  while (currentMonday.getFullYear() === year) {
    const month = currentMonday.getMonth();
    weeksPerMonth[month]++;

    // Move to next Monday
    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeksPerMonth;
}
