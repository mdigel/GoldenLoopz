import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';

// Type for PostHog event properties
type EventProperties = Record<string, string | number | boolean | string[] | number[]>;

// Hook for tracking screen views
export const useScreenTracking = (screenName: string, properties?: EventProperties) => {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.screen(screenName, properties);
  }, [screenName, posthog, properties]);
};

// Event names as constants for consistency
export const ANALYTICS_EVENTS = {
  // App lifecycle
  APP_OPENED: 'app_opened',

  // Log events
  LOG_ENTRY_SAVED: 'log_entry_saved',
  LOG_ENTRY_UPDATED: 'log_entry_updated',

  // Goal events
  GOAL_UPDATED: 'goal_updated',

  // Progress events
  PROGRESS_VIEWED: 'progress_viewed',
  CALENDAR_DAY_VIEWED: 'calendar_day_viewed',

  // Streak events
  STREAK_MILESTONE: 'streak_milestone',

  // Screen views
  SCREEN_LOG: 'Log',
  SCREEN_PROGRESS: 'Progress',
  SCREEN_PROFILE: 'Profile',
} as const;

// Type for analytics hook return
export interface AnalyticsHook {
  trackEvent: (event: string, properties?: EventProperties) => void;
  trackScreen: (screenName: string, properties?: EventProperties) => void;
}

// Hook for easy event tracking
export const useAnalytics = (): AnalyticsHook => {
  const posthog = usePostHog();

  const trackEvent = (event: string, properties?: EventProperties) => {
    posthog?.capture(event, properties);
  };

  const trackScreen = (screenName: string, properties?: EventProperties) => {
    posthog?.screen(screenName, properties);
  };

  return { trackEvent, trackScreen };
};

// Helper to track log entry with metrics
export function getLogEntryProperties(log: {
  buildingMinutes: number;
  marketingMinutes: number;
  levelingUpMinutes: number;
  workoutMinutes: number;
  drinks: number;
  tvMinutes: number;
  reflection: string;
}) {
  const metricsEntered: string[] = [];

  if (log.buildingMinutes > 0) metricsEntered.push('building');
  if (log.marketingMinutes > 0) metricsEntered.push('marketing');
  if (log.levelingUpMinutes > 0) metricsEntered.push('leveling_up');
  if (log.workoutMinutes > 0) metricsEntered.push('workout');
  if (log.drinks > 0) metricsEntered.push('drinks');
  if (log.tvMinutes > 0) metricsEntered.push('tv');

  return {
    metrics_entered: metricsEntered,
    metrics_count: metricsEntered.length,
    has_reflection: log.reflection.length > 0,
    total_positive_minutes:
      log.buildingMinutes + log.marketingMinutes + log.levelingUpMinutes + log.workoutMinutes,
    total_negative_minutes: log.tvMinutes,
  };
}
