import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLogStore } from '../../state/logStore';
import { useCustomMetricsStore, formatMetricValue } from '../../state/customMetricsStore';
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
}

function GoldenHoursBlock({ totalMinutes, buildingMinutes, marketingMinutes, learningMinutes }: GoldenHoursBlockProps) {
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
      <Text style={styles.totalValue}>{formatMinutesToDisplay(totalMinutes)}</Text>
      <View style={styles.breakdownList}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Building</Text>
          <Text style={[styles.breakdownValue, { color: METRICS.building.color }]}>{formatMinutesToDisplay(buildingMinutes)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Marketing</Text>
          <Text style={[styles.breakdownValue, { color: METRICS.marketing.color }]}>{formatMinutesToDisplay(marketingMinutes)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Learning</Text>
          <Text style={[styles.breakdownValue, { color: METRICS.levelingUp.color }]}>{formatMinutesToDisplay(learningMinutes)}</Text>
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
}

function DynamicMetricsBlock({ metrics, totals, showAsAverage, weeksElapsed = 1 }: DynamicMetricsBlockProps) {
  if (metrics.length === 0) return null;

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeader}>Other Metrics</Text>
      <View style={styles.breakdownList}>
        {metrics.map((metric) => {
          let value = getMetricTotal(metric, totals);

          // Calculate average if needed
          if (showAsAverage && weeksElapsed > 1) {
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

          return (
            <View key={metric.id} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{metric.name}</Text>
              <Text style={styles.breakdownValue}>{displayValue}</Text>
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

  // Calculate weekly averages (year to date), excluding vacation days
  const totalDays = yearTotals.totalDays || 1;
  const vacationDays = yearTotals.vacationDays || 0;
  const effectiveDays = Math.max(1, totalDays - vacationDays);
  const effectiveWeeks = Math.max(1, Math.ceil(effectiveDays / 7));

  const avgGoldenHoursPerWeek = (yearTotals.buildingMinutes + yearTotals.marketingMinutes + yearTotals.levelingUpMinutes) / effectiveWeeks;
  const avgBuildingPerWeek = yearTotals.buildingMinutes / effectiveWeeks;
  const avgMarketingPerWeek = yearTotals.marketingMinutes / effectiveWeeks;
  const avgLearningPerWeek = yearTotals.levelingUpMinutes / effectiveWeeks;

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

          {/* Weekly Average */}
          <StatsCard title="Weekly Average">
            <GoldenHoursBlock
              totalMinutes={Math.round(avgGoldenHoursPerWeek)}
              buildingMinutes={Math.round(avgBuildingPerWeek)}
              marketingMinutes={Math.round(avgMarketingPerWeek)}
              learningMinutes={Math.round(avgLearningPerWeek)}
            />
            <DynamicMetricsBlock
              metrics={activeCustomMetrics}
              totals={yearTotals}
              showAsAverage
              weeksElapsed={effectiveWeeks}
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
});
