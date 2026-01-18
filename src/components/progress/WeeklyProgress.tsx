import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react-native';
import { useLogStore } from '../../state/logStore';
import { useGoalsStore } from '../../state/goalsStore';
import { useCustomMetricsStore, formatMetricValue } from '../../state/customMetricsStore';
import { colors, METRICS } from '../../constants/colors';
import { formatMinutesToDisplay, minutesToHours } from '../../lib/dateUtils';
import { ConcentricRings } from '../ui/CircularProgress';
import { getWeek, startOfWeek, endOfWeek, format, addWeeks, isFuture } from 'date-fns';
import { CustomMetric, SYSTEM_METRIC_IDS } from '../../types';
import { calculateProRatedProgress, isFullVacationWeek, proRateGoal } from '../../lib/goalUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;

interface LegendItemProps {
  color: string;
  label: string;
  value: string;
  progress: number;
  iconSource?: number;
}

function LegendItem({ color, label, value, progress, iconSource }: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View style={styles.legendText}>
        <View style={styles.legendLabelRow}>
          {iconSource && (
            <Image source={iconSource} style={styles.legendIcon} resizeMode="contain" />
          )}
          <Text style={styles.legendLabel}>{label}</Text>
        </View>
        <Text style={styles.legendValue}>{value}</Text>
      </View>
      <Text style={styles.legendProgress}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

// Helper to get metric total from weekTotals
function getMetricTotal(metric: CustomMetric, weekTotals: any): number {
  if (metric.isSystemMetric && metric.linkedField) {
    return weekTotals[metric.linkedField] ?? 0;
  }
  return weekTotals.customMetricTotals?.[metric.id] ?? 0;
}

function getSystemMetricImage(metricId: string) {
  switch (metricId) {
    case SYSTEM_METRIC_IDS.EXERCISE:
      return require('../../../assets/dumbell.png');
    case SYSTEM_METRIC_IDS.DRINKS:
      return require('../../../assets/wine.png');
    case SYSTEM_METRIC_IDS.STREAMING:
      return require('../../../assets/tv.png');
    default:
      return null;
  }
}

export default function WeeklyProgress() {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const translateX = useSharedValue(0);

  const getWeekTotals = useLogStore((state) => state.getWeekTotals);
  const goals = useGoalsStore((state) => state.goals);
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const activeCustomMetrics = useMemo(() => customMetrics.filter(m => m.isActive), [customMetrics]);

  // Calculate the selected week's date
  const selectedWeekDate = useMemo(() => {
    const today = new Date();
    return addWeeks(today, weekOffset);
  }, [weekOffset]);

  // Get totals for the selected week
  const weekTotals = getWeekTotals(selectedWeekDate);

  // Calculate week number and date range for selected week
  const weekInfo = useMemo(() => {
    const weekStart = startOfWeek(selectedWeekDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeekDate, { weekStartsOn: 1 });
    const weekNumber = getWeek(selectedWeekDate, { weekStartsOn: 1 });
    const startDate = format(weekStart, 'M/d');
    const endDate = format(weekEnd, 'M/d');
    const year = format(selectedWeekDate, 'yyyy');
    const isCurrentWeek = weekOffset === 0;
    const isNextWeekFuture = isFuture(addWeeks(weekEnd, 1));
    return { weekNumber, dateRange: `${startDate} - ${endDate}`, year, isCurrentWeek, isNextWeekFuture };
  }, [selectedWeekDate, weekOffset]);

  // Navigation handlers
  const goToPreviousWeek = useCallback(() => {
    setWeekOffset(prev => prev - 1);
  }, []);

  const goToNextWeek = useCallback(() => {
    if (!weekInfo.isNextWeekFuture) {
      setWeekOffset(prev => prev + 1);
    }
  }, [weekInfo.isNextWeekFuture]);

  const goToCurrentWeek = useCallback(() => {
    setWeekOffset(0);
  }, []);

  // Swipe gesture - only activate on horizontal swipes, allow vertical scroll
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]) // Only activate after 20px horizontal movement
    .failOffsetY([-10, 10]) // Fail if vertical movement exceeds 10px first
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.3; // Dampen the movement
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped right - go to previous week
        runOnJS(goToPreviousWeek)();
      } else if (event.translationX < -SWIPE_THRESHOLD && !weekInfo.isNextWeekFuture) {
        // Swiped left - go to next week (if not in future)
        runOnJS(goToNextWeek)();
      }
      translateX.value = withTiming(0, { duration: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Calculate progress for each metric (0-1), pro-rated for vacation days
  const { vacationDays, daysLogged } = weekTotals;
  const isAllVacation = isFullVacationWeek(vacationDays, daysLogged);

  const buildingProgress = isAllVacation
    ? 1
    : calculateProRatedProgress(weekTotals.buildingMinutes, goals.buildingHours * 60, vacationDays) ?? 0;
  const marketingProgress = isAllVacation
    ? 1
    : calculateProRatedProgress(weekTotals.marketingMinutes, goals.marketingHours * 60, vacationDays) ?? 0;
  const learningProgress = isAllVacation
    ? 1
    : calculateProRatedProgress(weekTotals.levelingUpMinutes, goals.levelingUpHours * 60, vacationDays) ?? 0;

  const formatHours = (minutes: number) => {
    const hours = minutesToHours(minutes);
    return `${hours.toFixed(1)}h`;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Week Header with Navigation */}
        <View style={styles.weekHeader}>
          <View style={styles.weekNavRow}>
            <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
              <ChevronLeft size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            {weekInfo.isCurrentWeek ? (
              <View style={styles.weekHeaderCenter}>
                <Text style={styles.weekNumber}>Week {weekInfo.weekNumber}</Text>
                <Text style={styles.weekDateRange}>{weekInfo.dateRange}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={goToCurrentWeek} style={styles.weekHeaderCenter}>
                <Text style={styles.weekNumber}>Week {weekInfo.weekNumber}</Text>
                <Text style={styles.weekDateRange}>{weekInfo.dateRange}</Text>
                <Text style={styles.tapToReturn}>Tap to return to current week</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={goToNextWeek}
              style={styles.navButton}
              disabled={weekInfo.isNextWeekFuture}
            >
              <ChevronRight
                size={24}
                color={weekInfo.isNextWeekFuture ? colors.slate[300] : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Concentric Rings */}
        <View style={styles.ringsContainer}>
          <ConcentricRings
            buildingProgress={buildingProgress}
            marketingProgress={marketingProgress}
            learningProgress={learningProgress}
            size={260}
          />

          {/* Center Content - Logo or Palm Tree for vacation */}
          <View style={styles.centerContent}>
            {isAllVacation ? (
              <Image
                source={require('../../../assets/palm-tree.png')}
                style={styles.centerLogo}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../../../Logo_Ourofox.png')}
                style={styles.centerLogo}
                resizeMode="contain"
              />
            )}
          </View>
        </View>

      {/* Legend - Golden Hours */}
      <View style={styles.legendContainer}>
        <View style={styles.goldenHoursHeader}>
          <Image
            source={require('../../../assets/Gold_Bar.png')}
            style={styles.goldenHoursIcon}
            resizeMode="contain"
          />
          <Text style={styles.goldenHoursSectionTitle}>Golden Hours</Text>
        </View>
        <LegendItem
          color={colors.purple[500]}
          label={METRICS.building.label}
          value={formatHours(weekTotals.buildingMinutes)}
          progress={buildingProgress}
          iconSource={require('../../../assets/pickaxe.png')}
        />
        <LegendItem
          color={colors.cream[400]}
          label={METRICS.levelingUp.label}
          value={formatHours(weekTotals.levelingUpMinutes)}
          progress={learningProgress}
          iconSource={require('../../../assets/goldenyoutube.png')}
        />
        <LegendItem
          color={colors.gold[500]}
          label={METRICS.marketing.label}
          value={formatHours(weekTotals.marketingMinutes)}
          progress={marketingProgress}
          iconSource={require('../../../assets/megaphone.png')}
        />
      </View>

      {/* Custom Metrics Section */}
      {activeCustomMetrics.length > 0 && (
        <View style={styles.customMetricsSection}>
          <View style={styles.otherMetricsHeader}>
            <BarChart3 size={20} color={colors.text.secondary} />
            <Text style={styles.customMetricsSectionTitle}>Other Metrics</Text>
          </View>
          <View style={styles.customMetricsGrid}>
            {activeCustomMetrics.map((metric) => {
              const total = getMetricTotal(metric, weekTotals);
              const adjustedGoal = isAllVacation ? metric.weeklyGoal : proRateGoal(metric.weeklyGoal, vacationDays);
              const isNegative = metric.category === 'negative';
              const progress = adjustedGoal > 0
                ? Math.min(total / adjustedGoal, 1)
                : 0;
              const isOverLimit = isNegative && total > adjustedGoal;
              const progressPercent = Math.round(Math.min(progress, 1) * 100);
              const isBoolean = metric.unitType === 'boolean';
              const yesCount = total;
              const noCount = Math.max(daysLogged - yesCount, 0);
              const displayCount = isNegative ? noCount : yesCount;
              const displayLabel = isNegative ? 'No' : 'Yes';
              const valueDisplay = isBoolean
                ? `${displayCount} ${displayLabel}`
                : formatMetricValue(total, metric.unitType);
              const goalDisplay = isBoolean
                ? `${Math.round(adjustedGoal)} days`
                : formatMetricValue(Math.round(adjustedGoal), metric.unitType);

              return (
                <View key={metric.id} style={styles.customMetricCard}>
                  <View style={styles.customMetricHeader}>
                    <View style={styles.customMetricNameRow}>
                      {metric.isSystemMetric && getSystemMetricImage(metric.id) && (
                        <Image
                          source={getSystemMetricImage(metric.id)}
                          style={styles.customMetricIcon}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={styles.customMetricName}>{metric.name}</Text>
                    </View>
                    <Text style={[
                      styles.customMetricProgress,
                      isOverLimit && styles.customMetricOverLimit
                    ]}>
                      {progressPercent}%
                    </Text>
                  </View>
                  <Text style={styles.customMetricValue}>
                    {valueDisplay}
                  </Text>
                  <View style={styles.customMetricProgressBar}>
                    <View
                      style={[
                        styles.customMetricProgressFill,
                        {
                          width: `${Math.min(progress, 1) * 100}%`,
                          backgroundColor: isOverLimit ? colors.error : colors.slate[400],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.customMetricGoal}>
                    {isNegative ? 'Limit' : 'Goal'}: {goalDisplay}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  weekHeader: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  weekNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  weekHeaderCenter: {
    alignItems: 'center',
    flex: 1,
  },
  tapToReturn: {
    fontSize: 12,
    color: colors.purple[500],
    textAlign: 'center',
    marginTop: 4,
  },
  weekNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  weekDateRange: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  ringsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLogo: {
    width: 70,
    height: 70,
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
  },
  legendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  legendValue: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  legendProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  // Golden Hours Header
  goldenHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goldenHoursIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  goldenHoursSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Custom Metrics Section
  customMetricsSection: {
    width: '100%',
    paddingHorizontal: 16,
  },
  otherMetricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customMetricsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  customMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  customMetricCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  customMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customMetricNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customMetricIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  customMetricName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  customMetricProgress: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[500],
  },
  customMetricOverLimit: {
    color: colors.error,
  },
  customMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  customMetricProgressBar: {
    height: 4,
    backgroundColor: colors.slate[200],
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  customMetricProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  customMetricGoal: {
    fontSize: 11,
    color: colors.text.muted,
  },
});
