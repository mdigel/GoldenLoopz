import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyGoals, VacationMode, DEFAULT_GOALS } from '../types';

interface GoalsState {
  goals: WeeklyGoals;
  vacationMode: VacationMode;
  updateGoals: (updates: Partial<WeeklyGoals>) => void;
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
    (set) => ({
      goals: DEFAULT_GOALS,
      vacationMode: DEFAULT_VACATION_MODE,

      updateGoals: (updates: Partial<WeeklyGoals>) => {
        set((state) => ({
          goals: { ...state.goals, ...updates },
        }));
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
