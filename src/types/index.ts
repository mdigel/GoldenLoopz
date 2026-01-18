// Daily Log Entry
export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD format

  // Positive inputs (time in minutes)
  buildingMinutes: number;
  marketingMinutes: number;
  levelingUpMinutes: number;
  workoutMinutes: number;

  // Negative inputs
  drinks: number; // 0, 0.5, 1, 1.5, etc.
  tvMinutes: number;

  // Check-in
  moodScore: number; // 0-100 (burnout to motivated)
  reflection: string;

  // Day status
  isVacation: boolean;

  // Custom metrics (keyed by metric ID)
  customMetrics?: Record<string, number>;

  // Meta
  createdAt: string;
  updatedAt: string;
}

// Weekly Goals
export interface WeeklyGoals {
  buildingHours: number;
  marketingHours: number;
  levelingUpHours: number;
  workoutCount: number;

  // Optional caps
  maxDrinks?: number;
  maxTvHours?: number;
}

// Vacation Mode
export interface VacationMode {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

// Streak Data
export interface StreakData {
  currentLoggingStreak: number;
  currentBuildingStreak: number;
  lastLogDate: string | null;
  lastBuildingDate: string | null;
}

// Metric definitions for tooltips
export interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  type: 'time' | 'count';
  category: 'positive' | 'negative';
  increment: number; // Minutes for time, count for count
}

// Unit types for custom metrics
export type MetricUnitType = 'minutes' | 'hours' | 'count' | 'boolean';

// System metric IDs (pre-loaded metrics that can be deleted)
export const SYSTEM_METRIC_IDS = {
  EXERCISE: 'system_workout',
  DRINKS: 'system_drinks',
  STREAMING: 'system_streaming',
} as const;

// Fields in DailyLog that can be linked to system metrics
export type LinkedDailyLogField = 'workoutMinutes' | 'drinks' | 'tvMinutes';

// Custom metric definition
export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  unitType: MetricUnitType;
  category: 'positive' | 'negative';
  weeklyGoal: number; // For boolean, this is days per week
  color: string;
  icon?: string; // emoji
  isActive: boolean;
  createdAt: string;

  // System metric properties (for Exercise, Drinks, Streaming)
  isSystemMetric?: boolean;        // true for pre-loaded metrics
  linkedField?: LinkedDailyLogField; // maps to DailyLog field
}

// Custom metric value in daily log
export interface CustomMetricValue {
  metricId: string;
  value: number; // For boolean, 0 = false, 1 = true
}

// Helper to create empty log for today
export function createEmptyLog(date: string): DailyLog {
  const now = new Date().toISOString();
  return {
    id: `${date}_${Math.random().toString(36).substring(2, 9)}`,
    date,
    buildingMinutes: 0,
    marketingMinutes: 0,
    levelingUpMinutes: 0,
    workoutMinutes: 0,
    drinks: 0,
    tvMinutes: 0,
    moodScore: 50,
    reflection: '',
    isVacation: false,
    createdAt: now,
    updatedAt: now,
  };
}

// Default weekly goals
export const DEFAULT_GOALS: WeeklyGoals = {
  buildingHours: 0,
  marketingHours: 0,
  levelingUpHours: 0,
  workoutCount: 0,
  maxDrinks: undefined,
  maxTvHours: undefined,
};
