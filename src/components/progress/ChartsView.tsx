import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { addDays, addMonths, addWeeks, startOfMonth, startOfWeek } from 'date-fns';
import { useLogStore } from '../../state/logStore';
import { useCustomMetricsStore, formatMetricValue, getMetricValue } from '../../state/customMetricsStore';
import { colors, METRICS } from '../../constants/colors';
import { formatDate, parseDate } from '../../lib/dateUtils';
import { CustomMetric, DailyLog, MetricUnitType } from '../../types';

type RangeKey = '14d' | '3m' | '1y';

const RANGE_OPTIONS: Array<{ key: RangeKey; label: string }> = [
  { key: '14d', label: 'Last 14 days' },
  { key: '3m', label: 'Last 3 months' },
  { key: '1y', label: 'Last year' },
];

interface MetricDefinition {
  id: string;
  name: string;
  unitType: MetricUnitType;
  color: string;
  getValue: (log: DailyLog) => number;
}

const baseMetrics: MetricDefinition[] = [
  {
    id: 'buildingMinutes',
    name: METRICS.building.label,
    unitType: 'minutes',
    color: METRICS.building.color,
    getValue: (log) => log.buildingMinutes,
  },
  {
    id: 'marketingMinutes',
    name: METRICS.marketing.label,
    unitType: 'minutes',
    color: METRICS.marketing.color,
    getValue: (log) => log.marketingMinutes,
  },
  {
    id: 'levelingUpMinutes',
    name: METRICS.levelingUp.label,
    unitType: 'minutes',
    color: METRICS.levelingUp.color,
    getValue: (log) => log.levelingUpMinutes,
  },
];

function buildDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

function buildWeeklyBuckets(weeks: number): string[][] {
  const buckets: string[][] = [];
  const weekStartsOn = 1;
  const start = startOfWeek(addWeeks(new Date(), -(weeks - 1)), { weekStartsOn });
  for (let i = 0; i < weeks; i += 1) {
    const weekStart = addWeeks(start, i);
    const weekDates: string[] = [];
    for (let day = 0; day < 7; day += 1) {
      weekDates.push(formatDate(addDays(weekStart, day)));
    }
    buckets.push(weekDates);
  }
  return buckets;
}

function buildMonthlyBuckets(months: number): string[][] {
  const buckets: string[][] = [];
  const start = startOfMonth(addMonths(new Date(), -(months - 1)));
  for (let i = 0; i < months; i += 1) {
    const monthStart = addMonths(start, i);
    const monthDates: string[] = [];
    const current = new Date(monthStart);
    while (current.getMonth() === monthStart.getMonth()) {
      monthDates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    buckets.push(monthDates);
  }
  return buckets;
}

function formatMetricTotal(value: number, unitType: MetricUnitType): string {
  if (unitType === 'boolean') {
    return `${Math.round(value)} days`;
  }
  return formatMetricValue(Math.round(value), unitType);
}

function formatMetricAverage(value: number, unitType: MetricUnitType): string {
  if (unitType === 'boolean') {
    return `${Math.round(value * 100)}%`;
  }
  if (unitType === 'count') {
    return value.toFixed(1);
  }
  if (unitType === 'hours') {
    return formatMetricValue(Number(value.toFixed(1)), unitType);
  }
  return formatMetricValue(Math.round(value), unitType);
}

function getShortDateLabel(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface MiniBarChartProps {
  values: number[];
  color: string;
  labels: string[];
  valueFormatter: (value: number) => string;
  onSelect: (index: number | null) => void;
  selectedIndex: number | null;
}

function MiniBarChart({ values, color, labels, valueFormatter, onSelect, selectedIndex }: MiniBarChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const maxValue = Math.max(...values, 1);
  const midIndex = Math.floor((values.length - 1) / 2);
  const labelIndexes = [0, midIndex, values.length - 1];

  return (
    <View style={styles.chartContainer}>
      <View
        style={styles.barsRow}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
        {values.map((value, index) => {
          const heightPercent = Math.max(0.05, value / maxValue) * 100;
          return (
            <TouchableOpacity
              key={`${index}-${value}`}
              style={styles.barWrapper}
              activeOpacity={1}
              onPressIn={() => onSelect(index)}
              onPressOut={() => onSelect(null)}
            >
              <View
                style={[
                  styles.bar,
                  { height: `${heightPercent}%`, backgroundColor: color },
                ]}
              />
            </TouchableOpacity>
          );
        })}
        {selectedIndex !== null && chartWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.barValueContainer,
              {
                left: ((selectedIndex + 0.5) / values.length) * chartWidth,
                transform: [{ translateX: -(tooltipWidth / 2) }],
              },
            ]}
            onLayout={(event) => setTooltipWidth(event.nativeEvent.layout.width)}
          >
            <Text style={styles.barValueText}>{valueFormatter(values[selectedIndex])}</Text>
          </View>
        )}
      </View>
      <View style={styles.chartLabels}>
        {labelIndexes.map((index) => (
          <Text key={index} style={styles.chartLabel}>
            {labels[index]}
          </Text>
        ))}
      </View>
    </View>
  );
}

interface MetricChartCardProps {
  metric: MetricDefinition;
  values: number[];
  labels: string[];
  rangeLabel: string;
  totalDays: number;
}

function MetricChartCard({ metric, values, labels, rangeLabel, totalDays }: MetricChartCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = total / Math.max(1, totalDays);
  const selectedValue = selectedIndex !== null ? values[selectedIndex] : null;
  const selectedLabel = selectedIndex !== null ? labels[selectedIndex] : null;

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricName}>{metric.name}</Text>
        <Text style={styles.metricTotal}>{formatMetricTotal(total, metric.unitType)}</Text>
      </View>
      <MiniBarChart
        values={values}
        color={metric.color}
        labels={labels}
        valueFormatter={(value) => formatMetricValue(Math.round(value), metric.unitType)}
        onSelect={setSelectedIndex}
        selectedIndex={selectedIndex}
      />
      <View style={styles.metricFooter}>
        <Text style={styles.metricSubtitle}>{rangeLabel}</Text>
        <Text style={styles.metricAverage}>Avg/day {formatMetricAverage(average, metric.unitType)}</Text>
      </View>
    </View>
  );
}

export default function ChartsView() {
  const [range, setRange] = useState<RangeKey>('14d');
  const getLogForDate = useLogStore((state) => state.getLogForDate);
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const activeCustomMetrics = useMemo(
    () => customMetrics.filter((metric) => metric.isActive),
    [customMetrics]
  );

  const bucketData = useMemo(() => {
    if (range === '14d') {
      const dates = buildDateRange(14);
      return {
        buckets: dates.map((date) => [date]),
        labels: dates.map((date) => getShortDateLabel(date)),
        totalDays: dates.length,
        rangeLabel: 'Last 14 days',
      };
    }
    if (range === '3m') {
      const weeks = buildWeeklyBuckets(12);
      return {
        buckets: weeks,
        labels: weeks.map((bucket) => {
          const start = getShortDateLabel(bucket[0]);
          const end = getShortDateLabel(bucket[bucket.length - 1]);
          return `${start}–${end}`;
        }),
        totalDays: weeks.length * 7,
        rangeLabel: 'Last 3 months',
      };
    }
    const months = buildMonthlyBuckets(12);
    return {
      buckets: months,
      labels: months.map((bucket) => {
        const first = parseDate(bucket[0]);
        return first.toLocaleDateString('en-US', { month: 'short' });
      }),
      totalDays: months.reduce((sum, bucket) => sum + bucket.length, 0),
      rangeLabel: 'Last year',
    };
  }, [range]);

  const bucketLogs = useMemo(
    () =>
      bucketData.buckets.map((bucket) => bucket.map((date) => getLogForDate(date))),
    [bucketData.buckets, getLogForDate]
  );

  const metricDefinitions = useMemo(() => {
    const customDefinitions: MetricDefinition[] = activeCustomMetrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      unitType: metric.unitType,
      color: metric.color,
      getValue: (log) => getMetricValue(metric, log),
    }));
    return [...baseMetrics, ...customDefinitions];
  }, [activeCustomMetrics]);

  return (
    <View style={styles.container}>
      <View style={styles.rangeTabs}>
        {RANGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setRange(option.key)}
            activeOpacity={1}
            style={[
              styles.rangeTab,
              range === option.key && styles.rangeTabActive,
            ]}
          >
            <Text style={[styles.rangeTabText, range === option.key && styles.rangeTabTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {metricDefinitions.map((metric) => {
        const values = bucketLogs.map((bucket) =>
          bucket.reduce((sum, log) => sum + metric.getValue(log), 0)
        );
        return (
          <MetricChartCard
            key={metric.id}
            metric={metric}
            values={values}
            labels={bucketData.labels}
            rangeLabel={bucketData.rangeLabel}
            totalDays={bucketData.totalDays}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  rangeTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rangeTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.slate[100],
    borderRadius: 999,
  },
  rangeTabActive: {
    backgroundColor: colors.purple[50],
  },
  rangeTabText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  rangeTabTextActive: {
    color: colors.purple[700],
  },
  metricCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  metricTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  chartContainer: {
    marginBottom: 10,
  },
  barsRow: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barValueContainer: {
    position: 'absolute',
    top: -18,
    paddingHorizontal: 8,
    paddingVertical: 2,
    maxWidth: 120,
    backgroundColor: colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  barValueText: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: '600',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
  },
  metricAverage: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
