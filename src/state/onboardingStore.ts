import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  onboardingCompletedDate: string | null;
  hasSeenLogBanner: boolean;
  hasSeenProgressBanner: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  dismissLogBanner: () => void;
  dismissProgressBanner: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      onboardingCompletedDate: null,
      hasSeenLogBanner: false,
      hasSeenProgressBanner: false,

      completeOnboarding: () => {
        set((state) => ({
          hasCompletedOnboarding: true,
          onboardingCompletedDate: state.onboardingCompletedDate || new Date().toISOString().split('T')[0],
        }));
      },

      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false, hasSeenLogBanner: false, hasSeenProgressBanner: false });
      },

      dismissLogBanner: () => {
        set({ hasSeenLogBanner: true });
      },

      dismissProgressBanner: () => {
        set({ hasSeenProgressBanner: true });
      },
    }),
    {
      name: 'golden-loopz-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
