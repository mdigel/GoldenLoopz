import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, WeeklyGoals, StreakData, DEFAULT_GOALS } from '../types';

const KEYS = {
  LOGS: 'golden_loopz_logs',
  GOALS: 'golden_loopz_goals',
  STREAKS: 'golden_loopz_streaks',
} as const;

// ============================================
// LOGS
// ============================================

export async function getAllLogs(): Promise<Record<string, DailyLog>> {
  const data = await AsyncStorage.getItem(KEYS.LOGS);
  if (!data) return {};
  return JSON.parse(data);
}

export async function getLog(date: string): Promise<DailyLog | null> {
  const logs = await getAllLogs();
  return logs[date] || null;
}

export async function saveLog(log: DailyLog): Promise<void> {
  const logs = await getAllLogs();
  logs[log.date] = {
    ...log,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
}

export async function getLogsForDateRange(startDate: string, endDate: string): Promise<DailyLog[]> {
  const logs = await getAllLogs();
  const result: DailyLog[] = [];

  // Convert to comparable format
  const start = new Date(startDate);
  const end = new Date(endDate);

  Object.values(logs).forEach((log) => {
    const logDate = new Date(log.date);
    if (logDate >= start && logDate <= end) {
      result.push(log);
    }
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================
// GOALS
// ============================================

export async function getGoals(): Promise<WeeklyGoals> {
  const data = await AsyncStorage.getItem(KEYS.GOALS);
  if (!data) return DEFAULT_GOALS;
  return JSON.parse(data);
}

export async function saveGoals(goals: WeeklyGoals): Promise<void> {
  await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
}

// ============================================
// STREAKS
// ============================================

const DEFAULT_STREAKS: StreakData = {
  currentLoggingStreak: 0,
  currentBuildingStreak: 0,
  lastLogDate: null,
  lastBuildingDate: null,
};

export async function getStreaks(): Promise<StreakData> {
  const data = await AsyncStorage.getItem(KEYS.STREAKS);
  if (!data) return DEFAULT_STREAKS;
  return JSON.parse(data);
}

export async function saveStreaks(streaks: StreakData): Promise<void> {
  await AsyncStorage.setItem(KEYS.STREAKS, JSON.stringify(streaks));
}

// ============================================
// CLEAR ALL DATA (for development)
// ============================================

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.LOGS, KEYS.GOALS, KEYS.STREAKS]);
}

// ============================================
// EXPORT / DEBUG
// ============================================

export async function exportAllData(): Promise<{
  logs: Record<string, DailyLog>;
  goals: WeeklyGoals;
  streaks: StreakData;
}> {
  const [logs, goals, streaks] = await Promise.all([
    getAllLogs(),
    getGoals(),
    getStreaks(),
  ]);
  return { logs, goals, streaks };
}
