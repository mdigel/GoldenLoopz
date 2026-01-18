import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, createEmptyLog } from '../types';
import { getToday, getWeekDates, formatDate, getYearStart } from '../lib/dateUtils';
import { APP_CONFIG } from '../config/appConfig';
import { generateDummyLogs } from '../config/dummyData';

interface LogState {
  // State
  logs: Record<string, DailyLog>;
  isLoading: boolean;

  // Actions
  loadLogs: () => Promise<void>;
  getTodayLog: () => DailyLog;
  getLogForDate: (date: string) => DailyLog;
  updateLog: (date: string, updates: Partial<DailyLog>) => void;
  getLogsForWeek: (date?: Date) => DailyLog[];
  getLogsForMonth: (year: number, month: number) => DailyLog[];
  getLogsForYear: (year?: number) => DailyLog[];

  // Computed
  getWeekTotals: (date?: Date) => WeekTotals;
  getYearTotals: (year?: number) => YearTotals;
  getAllTimeTotals: () => WeekTotals;
}

interface WeekTotals {
  buildingMinutes: number;
  marketingMinutes: number;
  levelingUpMinutes: number;
  workoutMinutes: number;
  drinks: number;
  tvMinutes: number;
  daysLogged: number;
  workoutDays: number;
  vacationDays: number;
  averageMood: number;
  customMetricTotals: Record<string, number>; // Totals for custom metrics (keyed by metric ID)
}

interface YearTotals extends WeekTotals {
  totalDays: number;
}

// Helper to calculate custom metric totals from logs
function calculateCustomMetricTotals(logs: DailyLog[]): Record<string, number> {
  const totals: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.customMetrics) {
      Object.entries(log.customMetrics).forEach(([metricId, value]) => {
        totals[metricId] = (totals[metricId] || 0) + value;
      });
    }
  });
  return totals;
}

// Store implementation (shared between dummy and real modes)
const createLogStore: StateCreator<LogState> = (set, get) => ({
  logs: APP_CONFIG.USE_DUMMY_DATA ? generateDummyLogs() : {},
  isLoading: false,

  loadLogs: async () => {
    set({ isLoading: true });
    set({ isLoading: false });
  },

  getTodayLog: () => {
    const today = getToday();
    const logs = get().logs;
    if (logs[today]) {
      return logs[today];
    }
    return createEmptyLog(today);
  },

  getLogForDate: (date: string) => {
    const logs = get().logs;
    if (logs[date]) {
      return logs[date];
    }
    return createEmptyLog(date);
  },

  updateLog: (date: string, updates: Partial<DailyLog>) => {
    set((state) => {
      const existingLog = state.logs[date] || createEmptyLog(date);
      const updatedLog: DailyLog = {
        ...existingLog,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return {
        logs: { ...state.logs, [date]: updatedLog },
      };
    });
  },

  getLogsForWeek: (date?: Date) => {
    const weekDates = getWeekDates(date);
    const logs = get().logs;
    return weekDates
      .map((d) => logs[d])
      .filter((log): log is DailyLog => log !== undefined);
  },

  getLogsForMonth: (year: number, month: number) => {
    const logs = get().logs;
    return Object.values(logs).filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === year && logDate.getMonth() === month;
    });
  },

  getLogsForYear: (year?: number) => {
    const targetYear = year || new Date().getFullYear();
    const logs = get().logs;
    return Object.values(logs).filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === targetYear;
    });
  },

  getWeekTotals: (date?: Date) => {
    const weekLogs = get().getLogsForWeek(date);
    const totalMood = weekLogs.reduce((sum, log) => sum + log.moodScore, 0);
    const averageMood = weekLogs.length > 0 ? totalMood / weekLogs.length : 0;
    return {
      buildingMinutes: weekLogs.reduce((sum, log) => sum + log.buildingMinutes, 0),
      marketingMinutes: weekLogs.reduce((sum, log) => sum + log.marketingMinutes, 0),
      levelingUpMinutes: weekLogs.reduce((sum, log) => sum + log.levelingUpMinutes, 0),
      workoutMinutes: weekLogs.reduce((sum, log) => sum + log.workoutMinutes, 0),
      drinks: weekLogs.reduce((sum, log) => sum + log.drinks, 0),
      tvMinutes: weekLogs.reduce((sum, log) => sum + log.tvMinutes, 0),
      daysLogged: weekLogs.length,
      workoutDays: weekLogs.filter((log) => log.workoutMinutes > 0).length,
      vacationDays: weekLogs.filter((log) => log.isVacation).length,
      averageMood,
      customMetricTotals: calculateCustomMetricTotals(weekLogs),
    };
  },

  getYearTotals: (year?: number) => {
    const yearLogs = get().getLogsForYear(year);
    const totalMood = yearLogs.reduce((sum, log) => sum + log.moodScore, 0);
    const averageMood = yearLogs.length > 0 ? totalMood / yearLogs.length : 0;
    return {
      buildingMinutes: yearLogs.reduce((sum, log) => sum + log.buildingMinutes, 0),
      marketingMinutes: yearLogs.reduce((sum, log) => sum + log.marketingMinutes, 0),
      levelingUpMinutes: yearLogs.reduce((sum, log) => sum + log.levelingUpMinutes, 0),
      workoutMinutes: yearLogs.reduce((sum, log) => sum + log.workoutMinutes, 0),
      drinks: yearLogs.reduce((sum, log) => sum + log.drinks, 0),
      tvMinutes: yearLogs.reduce((sum, log) => sum + log.tvMinutes, 0),
      daysLogged: yearLogs.length,
      workoutDays: yearLogs.filter((log) => log.workoutMinutes > 0).length,
      vacationDays: yearLogs.filter((log) => log.isVacation).length,
      averageMood,
      customMetricTotals: calculateCustomMetricTotals(yearLogs),
      totalDays: Math.ceil(
        (Date.now() - getYearStart().getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  },

  getAllTimeTotals: () => {
    const allLogs = Object.values(get().logs);
    const totalMood = allLogs.reduce((sum, log) => sum + log.moodScore, 0);
    const averageMood = allLogs.length > 0 ? totalMood / allLogs.length : 0;
    return {
      buildingMinutes: allLogs.reduce((sum, log) => sum + log.buildingMinutes, 0),
      marketingMinutes: allLogs.reduce((sum, log) => sum + log.marketingMinutes, 0),
      levelingUpMinutes: allLogs.reduce((sum, log) => sum + log.levelingUpMinutes, 0),
      workoutMinutes: allLogs.reduce((sum, log) => sum + log.workoutMinutes, 0),
      drinks: allLogs.reduce((sum, log) => sum + log.drinks, 0),
      tvMinutes: allLogs.reduce((sum, log) => sum + log.tvMinutes, 0),
      daysLogged: allLogs.length,
      workoutDays: allLogs.filter((log) => log.workoutMinutes > 0).length,
      vacationDays: allLogs.filter((log) => log.isVacation).length,
      averageMood,
      customMetricTotals: calculateCustomMetricTotals(allLogs),
    };
  },
});

// Create store - with persistence for real data, without for dummy data
export const useLogStore = APP_CONFIG.USE_DUMMY_DATA
  ? create<LogState>()(createLogStore)
  : create<LogState>()(
      persist(createLogStore, {
        name: 'golden-loopz-logs',
        storage: createJSONStorage(() => AsyncStorage),
      })
    );
