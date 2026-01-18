import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomMetric, MetricUnitType, SYSTEM_METRIC_IDS, LinkedDailyLogField, DailyLog } from '../types';
import { colors } from '../constants/colors';

interface CustomMetricsState {
  metrics: CustomMetric[];
  addMetric: (metric: Omit<CustomMetric, 'id' | 'createdAt' | 'isActive'>) => void;
  updateMetric: (id: string, updates: Partial<CustomMetric>) => void;
  deleteMetric: (id: string) => void;
  toggleMetric: (id: string) => void;
  getActiveMetrics: () => CustomMetric[];
}

// Default colors for custom metrics
const METRIC_COLORS = [
  colors.purple[500],
  colors.gold[500],
  colors.cream[500],
  '#10B981', // emerald
  '#3B82F6', // blue
  '#EC4899', // pink
  '#F97316', // orange
  '#06B6D4', // cyan
];

// Pre-loaded system metrics (Exercise, Drinks, Streaming)
const DEFAULT_SYSTEM_METRICS: CustomMetric[] = [
  {
    id: SYSTEM_METRIC_IDS.EXERCISE,
    name: 'Exercise',
    description: 'Any intentional physical exercise. 20 min a day is 140 mins a week.',
    unitType: 'minutes',
    category: 'positive',
    weeklyGoal: 150, // 2.5 hours per week
    color: colors.purple[400],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    isSystemMetric: true,
    linkedField: 'workoutMinutes',
  },
  {
    id: SYSTEM_METRIC_IDS.DRINKS,
    name: 'Drinks',
    description: 'Number of alcoholic drinks consumed.',
    unitType: 'count',
    category: 'negative',
    weeklyGoal: 7, // max 7 per week
    color: colors.gold[400],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    isSystemMetric: true,
    linkedField: 'drinks',
  },
  {
    id: SYSTEM_METRIC_IDS.STREAMING,
    name: 'Streaming',
    description: 'Passive screen consumption not related to learning or building.',
    unitType: 'minutes',
    category: 'negative',
    weeklyGoal: 420, // 7 hours per week max
    color: colors.gold[300],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    isSystemMetric: true,
    linkedField: 'tvMinutes',
  },
];

function getNextColor(existingMetrics: CustomMetric[]): string {
  const usedColors = existingMetrics.map(m => m.color);
  const availableColor = METRIC_COLORS.find(c => !usedColors.includes(c));
  return availableColor || METRIC_COLORS[existingMetrics.length % METRIC_COLORS.length];
}

export const useCustomMetricsStore = create<CustomMetricsState>()(
  persist(
    (set, get) => ({
      metrics: [...DEFAULT_SYSTEM_METRICS],

      addMetric: (metric) => {
        const existingMetrics = get().metrics;
        const newMetric: CustomMetric = {
          ...metric,
          id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          color: metric.color || getNextColor(existingMetrics),
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          metrics: [...state.metrics, newMetric],
        }));
      },

      updateMetric: (id, updates) => {
        set((state) => ({
          metrics: state.metrics.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteMetric: (id) => {
        set((state) => {
          const metric = state.metrics.find((m) => m.id === id);
          // Soft delete for system metrics (just set isActive to false)
          if (metric?.isSystemMetric) {
            return {
              metrics: state.metrics.map((m) =>
                m.id === id ? { ...m, isActive: false } : m
              ),
            };
          }
          // Hard delete for custom metrics
          return {
            metrics: state.metrics.filter((m) => m.id !== id),
          };
        });
      },

      toggleMetric: (id) => {
        set((state) => ({
          metrics: state.metrics.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        }));
      },

      getActiveMetrics: () => {
        return get().metrics.filter((m) => m.isActive);
      },
    }),
    {
      name: 'golden-loopz-custom-metrics',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        // Migration: ensure system metrics exist for existing users
        if (version === 0 || !persistedState?.metrics) {
          return { metrics: [...DEFAULT_SYSTEM_METRICS] };
        }

        // Check if system metrics are missing and add them
        const existingIds = persistedState.metrics.map((m: CustomMetric) => m.id);
        const missingSystemMetrics = DEFAULT_SYSTEM_METRICS.filter(
          (sm) => !existingIds.includes(sm.id)
        );

        const mergedState = missingSystemMetrics.length > 0
          ? {
              ...persistedState,
              metrics: [...missingSystemMetrics, ...persistedState.metrics],
            }
          : persistedState;

        // Migration: refresh system metric copy (e.g., description updates)
        if (version < 3) {
          const systemMetricsById = new Map(
            DEFAULT_SYSTEM_METRICS.map((metric) => [metric.id, metric])
          );

          const updatedMetrics = mergedState.metrics.map((metric: CustomMetric) => {
            if (!metric.isSystemMetric) {
              return metric;
            }

            const updatedSystemMetric = systemMetricsById.get(metric.id);
            if (!updatedSystemMetric) {
              return metric;
            }

            return {
              ...metric,
              name: updatedSystemMetric.name,
              description: updatedSystemMetric.description,
              unitType: updatedSystemMetric.unitType,
              category: updatedSystemMetric.category,
              linkedField: updatedSystemMetric.linkedField,
            };
          });

          return {
            ...mergedState,
            metrics: updatedMetrics,
          };
        }

        return mergedState;
      },
    }
  )
);

// Helper functions
export function getUnitLabel(unitType: MetricUnitType): string {
  switch (unitType) {
    case 'minutes':
      return 'min/week';
    case 'hours':
      return 'hrs/week';
    case 'count':
      return '/week';
    case 'boolean':
      return 'days/week';
    default:
      return '';
  }
}

export function getUnitDisplayLabel(unitType: MetricUnitType): string {
  switch (unitType) {
    case 'minutes':
      return 'Minutes';
    case 'hours':
      return 'Hours';
    case 'count':
      return 'Count';
    case 'boolean':
      return 'Yes/No';
    default:
      return '';
  }
}

export function formatMetricValue(value: number, unitType: MetricUnitType): string {
  switch (unitType) {
    case 'minutes':
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      }
      return `${value}m`;
    case 'hours':
      return `${value}h`;
    case 'count':
      return value.toString();
    case 'boolean':
      return value === 1 ? 'Yes' : 'No';
    default:
      return value.toString();
  }
}

// Get metric value from a daily log (handles both system and custom metrics)
export function getMetricValue(metric: CustomMetric, log: DailyLog): number {
  if (metric.isSystemMetric && metric.linkedField) {
    return (log[metric.linkedField] as number) ?? 0;
  }
  return log.customMetrics?.[metric.id] ?? 0;
}

// Create partial update object for a metric value (handles both system and custom metrics)
export function setMetricValue(
  metric: CustomMetric,
  log: DailyLog,
  value: number
): Partial<DailyLog> {
  if (metric.isSystemMetric && metric.linkedField) {
    return { [metric.linkedField]: value };
  }
  return {
    customMetrics: {
      ...log.customMetrics,
      [metric.id]: value,
    },
  };
}

// Get default increment based on unit type
export function getDefaultIncrement(unitType: MetricUnitType): number {
  switch (unitType) {
    case 'minutes':
      return 15;
    case 'hours':
      return 1;
    case 'count':
      return 1;
    case 'boolean':
      return 1;
    default:
      return 1;
  }
}
