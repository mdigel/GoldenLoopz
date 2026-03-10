import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWeekStart, formatDate } from '../lib/dateUtils';

interface WeeklyReportState {
  // The Monday (YYYY-MM-DD) of the last week whose report was shown
  lastReportWeek: string | null;
  // Whether the modal is currently visible
  isVisible: boolean;

  // Check if we should show a report for last week and show it
  checkAndShow: () => void;
  // Force show the report (for dev simulate button)
  forceShow: () => void;
  dismiss: () => void;
}

export const useWeeklyReportStore = create<WeeklyReportState>()(
  persist(
    (set, get) => ({
      lastReportWeek: null,
      isVisible: false,

      checkAndShow: () => {
        const { lastReportWeek } = get();
        const today = new Date();
        const currentWeekStart = formatDate(getWeekStart(today));

        // The previous week's Monday
        const prevWeekDate = new Date(today);
        prevWeekDate.setDate(prevWeekDate.getDate() - 7);
        const prevWeekStart = formatDate(getWeekStart(prevWeekDate));

        // Only show if we haven't already shown for last week,
        // and we're in a new week (not the same week as prevWeekStart)
        if (currentWeekStart !== prevWeekStart && lastReportWeek !== prevWeekStart) {
          set({ isVisible: true, lastReportWeek: prevWeekStart });
        }
      },

      forceShow: () => {
        set({ isVisible: true });
      },

      dismiss: () => {
        set({ isVisible: false });
      },
    }),
    {
      name: 'golden-loopz-weekly-report',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lastReportWeek: state.lastReportWeek }),
    }
  )
);
