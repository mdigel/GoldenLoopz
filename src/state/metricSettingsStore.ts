import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MetricSetting {
  increment: number;
  defaultValue: number;
}

interface MetricSettingsState {
  settings: Record<string, MetricSetting>;
  updateSetting: (metricKey: string, updates: Partial<MetricSetting>) => void;
  getSetting: (metricKey: string) => MetricSetting;
  resetToDefaults: () => void;
}

export const DEFAULT_METRIC_SETTINGS: Record<string, MetricSetting> = {
  building: { increment: 15, defaultValue: 0 },
  marketing: { increment: 15, defaultValue: 0 },
  levelingUp: { increment: 15, defaultValue: 0 },
  workout: { increment: 5, defaultValue: 0 },
  drinks: { increment: 1, defaultValue: 0 },
  streaming: { increment: 15, defaultValue: 0 },
};

export const useMetricSettingsStore = create<MetricSettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_METRIC_SETTINGS,

      updateSetting: (metricKey: string, updates: Partial<MetricSetting>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [metricKey]: {
              ...state.settings[metricKey],
              ...updates,
            },
          },
        }));
      },

      getSetting: (metricKey: string): MetricSetting => {
        const state = get();
        return state.settings[metricKey] || DEFAULT_METRIC_SETTINGS[metricKey] || { increment: 1, defaultValue: 0 };
      },

      resetToDefaults: () => {
        set({ settings: DEFAULT_METRIC_SETTINGS });
      },
    }),
    {
      name: 'golden-loopz-metric-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
