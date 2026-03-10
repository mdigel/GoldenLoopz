import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLogStore } from '../../state/logStore';
import { useCustomMetricsStore, formatMetricValue } from '../../state/customMetricsStore';
import { useOnboardingStore } from '../../state/onboardingStore';
import { useGoalsStore } from '../../state/goalsStore';
import { colors, METRICS } from '../../constants/colors';
import { formatMinutesToDisplay } from '../../lib/dateUtils';
import { CustomMetric } from '../../types';
import ChartsView from './ChartsView';

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
}

function StatsCard({ title, children }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, isActive, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[
        styles.tabButton,
        isActive && styles.tabButtonActive,
      ]}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface GoldenHoursBlockProps {
  totalMinutes: number;
  buildingMinutes: number;
  marketingMinutes: number;
  learningMinutes: number;
  goalTotalMinutes?: number;
  goalBuildingMinutes?: number;
  goalMarketingMinutes?: number;
  goalLearningMinutes?: number;
}

function GoalComparisonValue({ minutes, goalMinutes, color }: { minutes: number; goalMinutes?: number; color: string }) {
  if (goalMinutes == null || goalMinutes <= 0) {
    return <Text style={[styles.breakdownValue, { color }]}>{formatMinutesToDisplay(minutes)}</Text>;
  }
  const meetsGoal = minutes >= goalMinutes;
  return (
    <View style={styles.goalValueRow}>
      <Text style={[styles.breakdownValue, { color: meetsGoal ? colors.success : color }]}>
        {formatMinutesToDisplay(minutes)}
      </Text>
      <Text style={styles.goalDivider}> / </Text>
      <Text style={styles.goalTarget}>{formatMinutesToDisplay(goalMinutes)}</Text>
    </View>
  );
}

function GoldenHoursBlock({ totalMinutes, buildingMinutes, marketingMinutes, learningMinutes, goalTotalMinutes, goalBuildingMinutes, goalMarketingMinutes, goalLearningMinutes }: GoldenHoursBlockProps) {
  const showGoals = goalTotalMinutes != null && goalTotalMinutes > 0;
  const meetsTotal = showGoals && totalMinutes >= goalTotalMinutes!;
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.goldenHoursHeader}>
        <Image
          source={require('../../../assets/Gold_Bar.png')}
          style={styles.goldBarIcon}
          resizeMode="contain"
        />
        <Text style={styles.sectionHeader}>Golden Hours</Text>
      </View>
      {showGoals ? (
        <View style={styles.totalGoalRow}>
          <Text style={[styles.totalValue, meetsTotal && { color: colors.success }]}>{formatMinutesToDisplay(totalMinutes)}</Text>
          <Text style={styles.totalGoalTarget}> / {formatMinutesToDisplay(goalTotalMinutes!)}</Text>
        </View>
      ) : (
        <Text style={styles.totalValue}>{formatMinutesToDisplay(totalMinutes)}</Text>
      )}
      <View style={styles.breakdownList}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Marketing</Text>
          <GoalComparisonValue minutes={marketingMinutes} goalMinutes={goalMarketingMinutes} color={METRICS.marketing.color} />
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Building</Text>
          <GoalComparisonValue minutes={buildingMinutes} goalMinutes={goalBuildingMinutes} color={METRICS.building.color} />
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Learning</Text>
          <GoalComparisonValue minutes={learningMinutes} goalMinutes={goalLearningMinutes} color={METRICS.levelingUp.color} />
        </View>
      </View>
    </View>
  );
}

// Helper to get metric total from totals object
function getMetricTotal(metric: CustomMetric, totals: any): number {
  if (metric.isSystemMetric && metric.linkedField) {
    return totals[metric.linkedField] ?? 0;
  }
  return totals.customMetricTotals?.[metric.id] ?? 0;
}

interface DynamicMetricsBlockProps {
  metrics: CustomMetric[];
  totals: any;
  showAsAverage?: boolean; // For weekly averages
  weeksElapsed?: number;
  customMetricGoals?: Record<string, number>; // For showing goal comparison
}

function DynamicMetricsBlock({ metrics, totals, showAsAverage, weeksElapsed = 1, customMetricGoals }: DynamicMetricsBlockProps) {
  if (metrics.length === 0) return null;

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeader}>Other Metrics</Text>
      <View style={styles.breakdownList}>
        {metrics.map((metric) => {
          let value = getMetricTotal(metric, totals);

          // Calculate average if needed
          if (showAsAverage && weeksElapsed > 0) {
            value = value / weeksElapsed;
          }

          // Format the value based on unit type and whether it's an average
          let displayValue: string;
          if (showAsAverage && metric.unitType === 'count') {
            displayValue = value.toFixed(1);
          } else if (showAsAverage && metric.unitType === 'minutes') {
            displayValue = formatMetricValue(Math.round(value), metric.unitType);
          } else {
            displayValue = formatMetricValue(Math.round(value), metric.unitType);
          }

          const goal = customMetricGoals?.[metric.id];
          const hasGoal = goal != null && goal > 0;
          const meetsGoal = hasGoal && (metric.category === 'negative' ? value <= goal! : value >= goal!);
          const goalDisplay = hasGoal ? formatMetricValue(goal!, metric.unitType) : null;

          return (
            <View key={metric.id} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{metric.name}</Text>
              {hasGoal ? (
                <View style={styles.goalValueRow}>
                  <Text style={[styles.breakdownValue, meetsGoal && { color: colors.success }]}>{displayValue}</Text>
                  <Text style={styles.goalDivider}> / </Text>
                  <Text style={styles.goalTarget}>{goalDisplay}</Text>
                </View>
              ) : (
                <Text style={styles.breakdownValue}>{displayValue}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function StatsView() {
  const [activeTab, setActiveTab] = useState<'data' | 'charts'>('data');
  const getYearTotals = useLogStore((state) => state.getYearTotals);
  const getAllTimeTotals = useLogStore((state) => state.getAllTimeTotals);
  const yearTotals = getYearTotals();
  const allTimeTotals = getAllTimeTotals();
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const activeCustomMetrics = useMemo(() => customMetrics.filter(m => m.isActive), [customMetrics]);
  const onboardingDate = useOnboardingStore((state) => state.onboardingCompletedDate);
  const goals = useGoalsStore((state) => state.goals);

  // Goal minutes for weekly comparison (goals are stored in hours)
  const goalBuildingMinutes = goals.buildingHours * 60;
  const goalMarketingMinutes = goals.marketingHours * 60;
  const goalLearningMinutes = goals.levelingUpHours * 60;
  const goalTotalMinutes = goalBuildingMinutes + goalMarketingMinutes + goalLearningMinutes;

  // Custom metric goals from the metrics themselves
  const customMetricGoals = useMemo(() => {
    const goals: Record<string, number> = {};
    activeCustomMetrics.forEach((m) => {
      if (m.weeklyGoal > 0) {
        goals[m.id] = m.weeklyGoal;
      }
    });
    return goals;
  }, [activeCustomMetrics]);

  // Calculate weekly averages based on actual data range for current year
  const logs = useLogStore((state) => state.logs);
  const effectiveWeeks = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Find earliest log date in current year
    const yearLogDates = Object.keys(logs)
      .filter((date) => date.startsWith(String(now.getFullYear())))
      .sort();

    if (yearLogDates.length === 0) return 1;

    const earliestLogDate = new Date(yearLogDates[0] + 'T00:00:00');
    const startDate = earliestLogDate < yearStart ? yearStart : earliestLogDate;

    const daysSinceStart = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const vacationDays = yearTotals.vacationDays || 0;
    const effectiveDays = Math.max(1, daysSinceStart - vacationDays);
    return Math.max(1, effectiveDays / 7);
  }, [logs, yearTotals.vacationDays]);

  const avgGoldenHoursPerWeek = (yearTotals.buildingMinutes + yearTotals.marketingMinutes + yearTotals.levelingUpMinutes) / effectiveWeeks;
  const avgBuildingPerWeek = yearTotals.buildingMinutes / effectiveWeeks;
  const avgMarketingPerWeek = yearTotals.marketingMinutes / effectiveWeeks;
  const avgLearningPerWeek = yearTotals.levelingUpMinutes / effectiveWeeks;

  // Effective weeks for all-time (since onboarding, not clamped to current year)
  const allTimeEffectiveWeeks = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (onboardingDate) {
      startDate = new Date(onboardingDate + 'T00:00:00');
    } else {
      // Fallback: use Jan 1 of current year
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const daysSinceStart = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const vacationDays = allTimeTotals.vacationDays || 0;
    const effectiveDays = Math.max(1, daysSinceStart - vacationDays);
    return Math.max(1, effectiveDays / 7);
  }, [onboardingDate, allTimeTotals.vacationDays]);

  // Year to date Golden Hours total
  const ytdGoldenHoursTotal = yearTotals.buildingMinutes + yearTotals.marketingMinutes + yearTotals.levelingUpMinutes;

  // All time Golden Hours total
  const allTimeGoldenHoursTotal = allTimeTotals.buildingMinutes + allTimeTotals.marketingMinutes + allTimeTotals.levelingUpMinutes;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabButton
          label="Data"
          isActive={activeTab === 'data'}
          onPress={() => setActiveTab('data')}
        />
        <TabButton
          label="Charts"
          isActive={activeTab === 'charts'}
          onPress={() => setActiveTab('charts')}
        />
      </View>

      {activeTab === 'data' ? (
        <View style={styles.cardsContainer}>
          {/* Weekly Average */}
          <StatsCard title="Weekly Average">
            <GoldenHoursBlock
              totalMinutes={Math.round(avgGoldenHoursPerWeek)}
              buildingMinutes={Math.round(avgBuildingPerWeek)}
              marketingMinutes={Math.round(avgMarketingPerWeek)}
              learningMinutes={Math.round(avgLearningPerWeek)}
              goalTotalMinutes={goalTotalMinutes}
              goalBuildingMinutes={goalBuildingMinutes}
              goalMarketingMinutes={goalMarketingMinutes}
              goalLearningMinutes={goalLearningMinutes}
            />
            <DynamicMetricsBlock
              metrics={activeCustomMetrics}
              totals={yearTotals}
              showAsAverage
              weeksElapsed={effectiveWeeks}
              customMetricGoals={customMetricGoals}
            />
          </StatsCard>

          {/* Year to Date */}
          <StatsCard title="Year to Date">
            <GoldenHoursBlock
              totalMinutes={ytdGoldenHoursTotal}
              buildingMinutes={yearTotals.buildingMinutes}
              marketingMinutes={yearTotals.marketingMinutes}
              learningMinutes={yearTotals.levelingUpMinutes}
            />
            <DynamicMetricsBlock
              metrics={activeCustomMetrics}
              totals={yearTotals}
            />
          </StatsCard>

          {/* All Time Stats */}
          <StatsCard title="All Time Stats">
            <GoldenHoursBlock
              totalMinutes={allTimeGoldenHoursTotal}
              buildingMinutes={allTimeTotals.buildingMinutes}
              marketingMinutes={allTimeTotals.marketingMinutes}
              learningMinutes={allTimeTotals.levelingUpMinutes}
            />
            <DynamicMetricsBlock
              metrics={activeCustomMetrics}
              totals={allTimeTotals}
            />
          </StatsCard>
        </View>
      ) : (
        <ChartsView />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    gap: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.slate[100],
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.purple[600],
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  goldenHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goldBarIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gold[500],
    marginBottom: 8,
  },
  breakdownList: {
    paddingLeft: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalDivider: {
    fontSize: 13,
    color: colors.text.muted,
  },
  goalTarget: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.muted,
  },
  totalGoalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  totalGoalTarget: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.muted,
  },
});
