import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyGoals, VacationMode, DEFAULT_GOALS, GoalHistoryEntry } from '../types';
import { getWeekStart } from '../lib/dateUtils';

interface GoalsState {
  goals: WeeklyGoals;
  vacationMode: VacationMode;
  goalHistory: GoalHistoryEntry[];
  updateGoals: (updates: Partial<WeeklyGoals>) => void;
  recordGoalSnapshot: (customMetricGoals?: Record<string, number>) => void;
  getGoalsForDate: (date: Date, customMetricGoals?: Record<string, number>) => GoalHistoryEntry;
  resetGoals: () => void;
  toggleVacationMode: () => void;
  setVacationMode: (isActive: boolean) => void;
}

const DEFAULT_VACATION_MODE: VacationMode = {
  isActive: false,
  startDate: null,
  endDate: null,
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: DEFAULT_GOALS,
      vacationMode: DEFAULT_VACATION_MODE,
      goalHistory: [],

      updateGoals: (updates: Partial<WeeklyGoals>) => {
        set((state) => ({
          goals: { ...state.goals, ...updates },
        }));
        // Record snapshot after update
        get().recordGoalSnapshot();
      },

      recordGoalSnapshot: (customMetricGoals?: Record<string, number>) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const { goals, goalHistory } = state;
          // Get custom metric goals from last entry if not provided
          const lastEntry = goalHistory[goalHistory.length - 1];
          const metricGoals = customMetricGoals ?? lastEntry?.customMetricGoals ?? {};

          const newEntry: GoalHistoryEntry = {
            effectiveDate: today,
            buildingHours: goals.buildingHours,
            marketingHours: goals.marketingHours,
            levelingUpHours: goals.levelingUpHours,
            customMetricGoals: metricGoals,
          };

          // Replace if there's already an entry for today, otherwise append
          const existingTodayIndex = goalHistory.findIndex(e => e.effectiveDate === today);
          if (existingTodayIndex >= 0) {
            const updated = [...goalHistory];
            updated[existingTodayIndex] = newEntry;
            return { goalHistory: updated };
          }
          return { goalHistory: [...goalHistory, newEntry] };
        });
      },

      getGoalsForDate: (date: Date, currentCustomMetricGoals?: Record<string, number>) => {
        const { goals, goalHistory } = get();
        // Use the end of the week (Sunday) for lookup — goals set during a week apply to that week
        const weekEnd = new Date(getWeekStart(date));
        weekEnd.setDate(weekEnd.getDate() + 6);
        const dateStr = weekEnd.toISOString().split('T')[0];

        // Find the latest history entry on or before the week end
        let matchingEntry: GoalHistoryEntry | null = null;
        for (let i = goalHistory.length - 1; i >= 0; i--) {
          if (goalHistory[i].effectiveDate <= dateStr) {
            matchingEntry = goalHistory[i];
            break;
          }
        }

        // If we found a historical entry, use it
        if (matchingEntry) {
          return matchingEntry;
        }

        // No history yet — return current goals (backwards compatible)
        return {
          effectiveDate: dateStr,
          buildingHours: goals.buildingHours,
          marketingHours: goals.marketingHours,
          levelingUpHours: goals.levelingUpHours,
          customMetricGoals: currentCustomMetricGoals ?? {},
        };
      },

      resetGoals: () => {
        set({ goals: DEFAULT_GOALS });
      },

      toggleVacationMode: () => {
        set((state) => ({
          vacationMode: {
            ...state.vacationMode,
            isActive: !state.vacationMode.isActive,
            startDate: !state.vacationMode.isActive ? new Date().toISOString().split('T')[0] : state.vacationMode.startDate,
            endDate: state.vacationMode.isActive ? new Date().toISOString().split('T')[0] : null,
          },
        }));
      },

      setVacationMode: (isActive: boolean) => {
        set((state) => ({
          vacationMode: {
            ...state.vacationMode,
            isActive,
            startDate: isActive ? new Date().toISOString().split('T')[0] : state.vacationMode.startDate,
            endDate: !isActive ? new Date().toISOString().split('T')[0] : null,
          },
        }));
      },
    }),
    {
      name: 'golden-loopz-goals',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper to calculate progress percentage
export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
}

// Helper to check if goal is met
export function isGoalMet(current: number, goal: number): boolean {
  return current >= goal;
}

// Helper to get remaining to reach goal
export function getRemaining(current: number, goal: number): number {
  return Math.max(0, goal - current);
}
