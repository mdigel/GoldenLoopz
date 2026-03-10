import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useWeeklyReportStore } from '../state/weeklyReportStore';
import { useLogStore } from '../state/logStore';
import { useGoalsStore } from '../state/goalsStore';
import { useCustomMetricsStore, formatMetricValue } from '../state/customMetricsStore';
import { useOnboardingStore } from '../state/onboardingStore';
import { colors, METRICS } from '../constants/colors';
import { getWeekStart, formatDate, formatMinutesToDisplay, minutesToHours } from '../lib/dateUtils';
import { proRateGoal, getTotalUnavailableDays, isFullVacationWeek } from '../lib/goalUtils';
import { CustomMetric, SYSTEM_METRIC_IDS } from '../types';
import { format, startOfWeek, endOfWeek } from 'date-fns';

function getMetricTotal(metric: CustomMetric, weekTotals: any): number {
  if (metric.isSystemMetric && metric.linkedField) {
    return weekTotals[metric.linkedField] ?? 0;
  }
  return weekTotals.customMetricTotals?.[metric.id] ?? 0;
}

interface MetricRowProps {
  label: string;
  value: string;
  goal: string;
  percent: number;
  color: string;
  isNegative?: boolean;
  iconSource?: number;
}

function MetricRow({ label, value, goal, percent, color, isNegative, iconSource }: MetricRowProps) {
  const isOver = isNegative && percent > 100;
  const barPercent = Math.min(percent, 100);

  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.labelRow}>
        {iconSource && (
          <Image source={iconSource} style={rowStyles.icon} resizeMode="contain" />
        )}
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={[rowStyles.percent, isOver && { color: colors.error }]}>
          {Math.round(percent)}%
        </Text>
      </View>
      <View style={rowStyles.barBg}>
        <View
          style={[
            rowStyles.barFill,
            {
              width: `${barPercent}%`,
              backgroundColor: isOver ? colors.error : color,
            },
          ]}
        />
      </View>
      <Text style={rowStyles.valueText}>
        {value} / {goal}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  percent: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  barBg: {
    height: 8,
    backgroundColor: colors.slate[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  valueText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});

export default function WeeklySummaryModal() {
  const isVisible = useWeeklyReportStore((s) => s.isVisible);
  const dismiss = useWeeklyReportStore((s) => s.dismiss);
  const getWeekTotals = useLogStore((s) => s.getWeekTotals);
  const goals = useGoalsStore((s) => s.goals);
  const getGoalsForDate = useGoalsStore((s) => s.getGoalsForDate);
  const customMetrics = useCustomMetricsStore((s) => s.metrics);
  const activeMetrics = useMemo(() => customMetrics.filter((m) => m.isActive), [customMetrics]);
  const onboardingDate = useOnboardingStore((s) => s.onboardingCompletedDate);

  // Last week's date (any day in last week)
  const lastWeekDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, [isVisible]);

  const weekTotals = getWeekTotals(lastWeekDate);

  const currentCustomMetricGoals = useMemo(() => {
    const map: Record<string, number> = {};
    activeMetrics.forEach((m) => {
      map[m.id] = m.weeklyGoal;
    });
    return map;
  }, [activeMetrics]);

  const weekGoals = getGoalsForDate(lastWeekDate, currentCustomMetricGoals);

  const { vacationDays, daysLogged } = weekTotals;
  const unavailableDays = getTotalUnavailableDays(vacationDays, lastWeekDate, onboardingDate);
  const isAllVacation = isFullVacationWeek(vacationDays, daysLogged);
  const isAllUnavailable = unavailableDays >= 7;

  const formatHours = (minutes: number) => {
    const hours = minutesToHours(minutes);
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  // Golden Hours metrics
  const goldenHours = useMemo(() => {
    const metrics = [
      {
        label: METRICS.marketing.label,
        actual: weekTotals.marketingMinutes,
        goalRaw: weekGoals.marketingHours * 60,
        color: colors.purple[500],
        iconSource: require('../../assets/megaphone.png'),
      },
      {
        label: METRICS.building.label,
        actual: weekTotals.buildingMinutes,
        goalRaw: weekGoals.buildingHours * 60,
        color: colors.gold[500],
        iconSource: require('../../assets/pickaxe.png'),
      },
      {
        label: METRICS.levelingUp.label,
        actual: weekTotals.levelingUpMinutes,
        goalRaw: weekGoals.levelingUpHours * 60,
        color: colors.cream[400],
        iconSource: require('../../assets/goldenyoutube.png'),
      },
    ];

    return metrics.map((m) => {
      const adjusted = (isAllVacation || isAllUnavailable)
        ? m.goalRaw
        : proRateGoal(m.goalRaw, unavailableDays);
      const percent = adjusted > 0 ? (m.actual / adjusted) * 100 : 0;
      return {
        ...m,
        goal: adjusted,
        percent,
      };
    });
  }, [weekTotals, weekGoals, unavailableDays, isAllVacation, isAllUnavailable]);

  const totalGoldenActual = goldenHours.reduce((s, m) => s + m.actual, 0);
  const totalGoldenGoal = goldenHours.reduce((s, m) => s + m.goal, 0);
  const totalGoldenPercent = totalGoldenGoal > 0
    ? Math.round((totalGoldenActual / totalGoldenGoal) * 100)
    : 0;

  // Week date range label
  const weekLabel = useMemo(() => {
    const ws = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
    const we = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
    return `${format(ws, 'MMM d')} - ${format(we, 'MMM d')}`;
  }, [lastWeekDate]);

  // Mood: stored as 0-100, displayed as 1-10
  const avgMood = Math.round((weekTotals.averageMood / 100) * 9) + 1;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackground} onPress={dismiss} />
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Weekly Report</Text>
              <Text style={styles.subtitle}>{weekLabel}</Text>
            </View>
            <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {isAllVacation ? (
              <View style={styles.vacationBanner}>
                <Image
                  source={require('../../assets/palm-tree.png')}
                  style={styles.vacationIcon}
                  resizeMode="contain"
                />
                <Text style={styles.vacationText}>
                  You were on vacation last week. Enjoy the rest!
                </Text>
              </View>
            ) : (
              <>
                {/* Overall summary */}
                <View style={styles.summaryCard}>
                  <Image
                    source={require('../../assets/Gold_Bar.png')}
                    style={styles.goldBarIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.summaryTextContainer}>
                    <Text style={styles.summaryLabel}>Golden Hours</Text>
                    <Text style={styles.summaryValue}>
                      {formatHours(totalGoldenActual)} / {formatHours(totalGoldenGoal)}
                    </Text>
                  </View>
                  <Text style={styles.summaryPercent}>{totalGoldenPercent}%</Text>
                </View>

                {/* Golden Hours breakdown */}
                <View style={styles.section}>
                  {goldenHours.map((m) => (
                    <MetricRow
                      key={m.label}
                      label={m.label}
                      value={formatHours(m.actual)}
                      goal={formatHours(m.goal)}
                      percent={m.percent}
                      color={m.color}
                      iconSource={m.iconSource}
                    />
                  ))}
                </View>

                {/* Custom Metrics */}
                {activeMetrics.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other Metrics</Text>
                    {activeMetrics.map((metric) => {
                      const total = getMetricTotal(metric, weekTotals);
                      const historicalGoal =
                        weekGoals.customMetricGoals[metric.id] ?? metric.weeklyGoal;
                      const adjustedGoal =
                        isAllVacation || isAllUnavailable
                          ? historicalGoal
                          : proRateGoal(historicalGoal, unavailableDays);
                      const percent = adjustedGoal > 0 ? (total / adjustedGoal) * 100 : 0;
                      const isBoolean = metric.unitType === 'boolean';
                      const isNegative = metric.category === 'negative';
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

                      const iconSource =
                        metric.id === SYSTEM_METRIC_IDS.EXERCISE
                          ? require('../../assets/dumbell.png')
                          : metric.id === SYSTEM_METRIC_IDS.DRINKS
                            ? require('../../assets/wine.png')
                            : metric.id === SYSTEM_METRIC_IDS.STREAMING
                              ? require('../../assets/tv.png')
                              : undefined;

                      return (
                        <MetricRow
                          key={metric.id}
                          label={metric.name}
                          value={valueDisplay}
                          goal={goalDisplay}
                          percent={percent}
                          color={colors.slate[400]}
                          isNegative={isNegative}
                          iconSource={iconSource}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Mood & Days */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{daysLogged}</Text>
                    <Text style={styles.statLabel}>Days Logged</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{Math.round(avgMood)}</Text>
                    <Text style={styles.statLabel}>Avg Mood</Text>
                  </View>
                  {vacationDays > 0 && (
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{vacationDays}</Text>
                      <Text style={styles.statLabel}>Vacation</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          {/* Dismiss button */}
          <TouchableOpacity style={styles.dismissButton} onPress={dismiss} activeOpacity={0.8}>
            <Text style={styles.dismissButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  goldBarIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  summaryPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gold[600],
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  vacationBanner: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  vacationIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  vacationText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dismissButton: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: colors.gold[500],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
