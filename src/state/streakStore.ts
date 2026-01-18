import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakData } from '../types';
import { getToday, isYesterday } from '../lib/dateUtils';
import { APP_CONFIG } from '../config/appConfig';
import { format, subDays } from 'date-fns';

// Generate dummy streak data
const getDummyStreakData = (): StreakData => {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  return {
    currentLoggingStreak: 12,
    currentBuildingStreak: 8,
    lastLogDate: yesterday,
    lastBuildingDate: yesterday,
  };
};

interface StreakState extends StreakData {
  // Actions
  recordLogEntry: (date: string, hadBuilding: boolean) => void;
  checkAndResetStreaks: () => void;
  getLoggingStreak: () => number;
  getBuildingStreak: () => number;
}

// Store implementation
const createStreakStore: StateCreator<StreakState> = (set, get) => ({
  ...(APP_CONFIG.USE_DUMMY_DATA
    ? getDummyStreakData()
    : {
        currentLoggingStreak: 0,
        currentBuildingStreak: 0,
        lastLogDate: null,
        lastBuildingDate: null,
      }),

  recordLogEntry: (date: string, hadBuilding: boolean) => {
    const state = get();
    const today = getToday();

    if (date !== today) return;

    let newLoggingStreak = state.currentLoggingStreak;
    let newBuildingStreak = state.currentBuildingStreak;

    if (state.lastLogDate === null) {
      newLoggingStreak = 1;
    } else if (state.lastLogDate === today) {
      // Already logged today
    } else if (isYesterday(state.lastLogDate)) {
      newLoggingStreak = state.currentLoggingStreak + 1;
    } else {
      newLoggingStreak = 1;
    }

    if (hadBuilding) {
      if (state.lastBuildingDate === null) {
        newBuildingStreak = 1;
      } else if (state.lastBuildingDate === today) {
        // Already had building today
      } else if (isYesterday(state.lastBuildingDate)) {
        newBuildingStreak = state.currentBuildingStreak + 1;
      } else {
        newBuildingStreak = 1;
      }
    }

    set({
      currentLoggingStreak: newLoggingStreak,
      currentBuildingStreak: hadBuilding ? newBuildingStreak : state.currentBuildingStreak,
      lastLogDate: today,
      lastBuildingDate: hadBuilding ? today : state.lastBuildingDate,
    });
  },

  checkAndResetStreaks: () => {
    const state = get();
    const today = getToday();

    if (state.lastLogDate && !isYesterday(state.lastLogDate) && state.lastLogDate !== today) {
      set({ currentLoggingStreak: 0 });
    }

    if (
      state.lastBuildingDate &&
      !isYesterday(state.lastBuildingDate) &&
      state.lastBuildingDate !== today
    ) {
      set({ currentBuildingStreak: 0 });
    }
  },

  getLoggingStreak: () => {
    get().checkAndResetStreaks();
    return get().currentLoggingStreak;
  },

  getBuildingStreak: () => {
    get().checkAndResetStreaks();
    return get().currentBuildingStreak;
  },
});

// Create store - with persistence for real data, without for dummy data
export const useStreakStore = APP_CONFIG.USE_DUMMY_DATA
  ? create<StreakState>()(createStreakStore)
  : create<StreakState>()(
      persist(createStreakStore, {
        name: 'golden-loopz-streaks',
        storage: createJSONStorage(() => AsyncStorage),
      })
    );
