import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useLogStore } from '../../state/logStore';
import { useGoalsStore } from '../../state/goalsStore';
import { useCustomMetricsStore } from '../../state/customMetricsStore';
import { colors, METRICS } from '../../constants/colors';
import { getWeekStart, getWeeksPerMonth } from '../../lib/dateUtils';
import { startOfYear, addWeeks, getWeek, getMonth, isBefore } from 'date-fns';
import { CustomMetric, SYSTEM_METRIC_IDS } from '../../types';
import { calculateProRatedProgress, isFullVacationWeek, proRateGoal } from '../../lib/goalUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = 56;
const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// MetricType now supports dynamic custom metric IDs
type MetricType = 'golden_hours' | 'mood' | string;

interface MetricOption {
  key: MetricType;
  label: string;
}

// Mini concentric rings component for calendar cells
interface MiniConcentricRingsProps {
  buildingProgress: number;
  marketingProgress: number;
  learningProgress: number;
  size?: number;
}

const MiniConcentricRings: React.FC<MiniConcentricRingsProps> = ({
  buildingProgress,
  marketingProgress,
  learningProgress,
  size = 44,
}) => {
  const strokeWidth = 4;
  const gap = 1;

  const outerRadius = (size - strokeWidth) / 2;
  const middleRadius = outerRadius - strokeWidth - gap;
  const innerRadius = middleRadius - strokeWidth - gap;

  const outerCircumference = 2 * Math.PI * outerRadius;
  const middleCircumference = 2 * Math.PI * middleRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const center = size / 2;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="miniPurpleGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#8C4ECB" />
          <Stop offset="92.5%" stopColor="#BF5AD3" />
        </LinearGradient>
        <LinearGradient id="miniGoldGradient" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0C" />
          <Stop offset="100%" stopColor="#F56F01" />
        </LinearGradient>
      </Defs>

      {/* Outer ring - Building (Purple) */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke="#EFABFE"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke="url(#miniPurpleGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={outerCircumference}
        strokeDashoffset={outerCircumference * (1 - Math.min(buildingProgress, 1))}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />

      {/* Middle ring - Learning (Yellow/Cream) */}
      <Circle
        cx={center}
        cy={center}
        r={middleRadius}
        stroke="#EFE1B7"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={middleRadius}
        stroke="#FDD219"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={middleCircumference}
        strokeDashoffset={middleCircumference * (1 - Math.min(learningProgress, 1))}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />

      {/* Inner ring - Marketing (Gold/Orange) */}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius}
        stroke="#E9C08F"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={innerRadius}
        stroke="url(#miniGoldGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={innerCircumference}
        strokeDashoffset={innerCircumference * (1 - Math.min(marketingProgress, 1))}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
};

// Single progress ring for non-Golden Hours metrics
interface SingleProgressRingProps {
  progress: number;
  goalMet: boolean;
  size?: number;
  color: string;
  bgColor: string;
}

const SingleProgressRing: React.FC<SingleProgressRingProps> = ({
  progress,
  goalMet,
  size = 44,
  color,
  bgColor,
}) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(progress, 1))}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {goalMet && (
        <View style={[styles.checkOverlay, { width: size, height: size }]}>
          <View style={styles.checkCircle}>
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        </View>
      )}
    </View>
  );
};

// Limit breached indicator with red X and excess amount
interface LimitBreachedProps {
  excessAmount: number;
  size?: number;
}

const LimitBreached: React.FC<LimitBreachedProps> = ({ excessAmount, size = 44 }) => (
  <View style={[styles.limitBreachedContainer, { width: size, height: size }]}>
    <X size={24} color={colors.error} strokeWidth={3} />
    <Text style={styles.limitBreachedText}>+{excessAmount}</Text>
  </View>
);

// Mood circle showing the 1-10 value with corresponding color
interface MoodCircleProps {
  moodValue: number; // 1-10 scale
  size?: number;
}

const MoodCircle: React.FC<MoodCircleProps> = ({ moodValue, size = 36 }) => {
  const moodColor = colors.mood[moodValue as keyof typeof colors.mood] || colors.slate[300];

  return (
    <View
      style={[
        styles.moodCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: moodColor,
        },
      ]}
    >
      <Text style={styles.moodCircleText}>{moodValue}</Text>
    </View>
  );
};

// Empty dot for future/no data weeks
const EmptyDot: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <View
    style={[
      styles.emptyDot,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  />
);

// Custom metric progress data for a week
interface CustomMetricWeekData {
  progress: number;
  excess: number; // For negative metrics (limits)
}

// Week cell component
interface WeekCellProps {
  weekStart: Date;
  selectedMetric: MetricType;
  buildingProgress: number;
  marketingProgress: number;
  learningProgress: number;
  customMetricData: Record<string, CustomMetricWeekData>;
  moodScore: number;
  isVacation: boolean;
  hasData: boolean;
  isFuture: boolean;
  customMetrics: CustomMetric[]; // Active custom metrics for lookup
}

const WeekCell: React.FC<WeekCellProps> = ({
  weekStart,
  selectedMetric,
  buildingProgress,
  marketingProgress,
  learningProgress,
  customMetricData,
  moodScore,
  isVacation,
  hasData,
  isFuture,
  customMetrics,
}) => {
  // Check if all Golden Hours goals are met
  const allGoldenHoursMet = buildingProgress >= 1 && marketingProgress >= 1 && learningProgress >= 1;
  const anyGoldenHoursProgress = buildingProgress > 0 || marketingProgress > 0 || learningProgress > 0;

  // Show vacation icon
  if (isVacation) {
    return (
      <View style={styles.weekCell}>
        <Image
          source={require('../../../assets/palm-tree.png')}
          style={styles.vacationIcon}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Show empty dot for future weeks or no data
  if (isFuture || !hasData) {
    return (
      <View style={styles.weekCell}>
        <EmptyDot />
      </View>
    );
  }

  // Render based on selected metric
  if (selectedMetric === 'golden_hours') {
    // Show logo if all goals met, otherwise show concentric rings
    if (allGoldenHoursMet) {
      return (
        <View style={styles.weekCell}>
            <Image
              source={require('../../../assets/logo.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (anyGoldenHoursProgress) {
      return (
        <View style={styles.weekCell}>
          <MiniConcentricRings
            buildingProgress={buildingProgress}
            marketingProgress={marketingProgress}
            learningProgress={learningProgress}
          />
        </View>
      );
    }

    return (
      <View style={styles.weekCell}>
        <EmptyDot />
      </View>
    );
  }

  // Handle mood metric
  if (selectedMetric === 'mood') {
    // Convert 0-100 score to 1-10 scale and show colored circle
    const moodValue = Math.round((moodScore / 100) * 9) + 1;
    if (moodScore === 0) {
      return (
        <View style={styles.weekCell}>
          <EmptyDot />
        </View>
      );
    }
    return (
      <View style={styles.weekCell}>
        <MoodCircle moodValue={moodValue} />
      </View>
    );
  }

  // Handle custom metrics (including system metrics)
  const metric = customMetrics.find(m => m.id === selectedMetric);
  const metricData = customMetricData[selectedMetric];

  if (!metric || !metricData) {
    return (
      <View style={styles.weekCell}>
        <EmptyDot />
      </View>
    );
  }

  const { progress, excess } = metricData;
  const ringColor = metric.color;
  const bgColor = colors.slate[200]; // Default background

  // For negative metrics (limits), show red X if breached
  if (metric.category === 'negative' && progress >= 1 && excess > 0) {
    return (
      <View style={styles.weekCell}>
        <LimitBreached excessAmount={excess} />
      </View>
    );
  }

  // For negative metrics, goal is to stay at or under limit
  // For positive metrics, goal is to reach 100%
  const goalMet = metric.category === 'negative' ? excess === 0 : progress >= 1;

  if (progress === 0 && !goalMet) {
    return (
      <View style={styles.weekCell}>
        <EmptyDot />
      </View>
    );
  }

  return (
    <View style={styles.weekCell}>
      <SingleProgressRing
        progress={progress}
        goalMet={goalMet}
        color={ringColor}
        bgColor={bgColor}
      />
    </View>
  );
};

export default function CalendarView() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('golden_hours');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getWeekTotals = useLogStore((state) => state.getWeekTotals);
  const goals = useGoalsStore((state) => state.goals);
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const activeCustomMetrics = useMemo(() => customMetrics.filter(m => m.isActive), [customMetrics]);

  // Build dynamic metric options from active custom metrics
  const metricOptions = useMemo<MetricOption[]>(() => {
    const options: MetricOption[] = [
      { key: 'golden_hours', label: 'Golden Hours' },
    ];

    // Add active custom metrics
    activeCustomMetrics.forEach((metric) => {
      options.push({ key: metric.id, label: metric.name });
    });

    // Add mood at the end
    options.push({ key: 'mood', label: 'Mood' });

    return options;
  }, [activeCustomMetrics]);

  // Generate grid data: 12 months × ~5 weeks per month
  const gridData = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const today = new Date();

    // Group weeks by month
    const monthsData: {
      month: number;
      weeks: {
        weekStart: Date;
        weekNum: number;
        buildingProgress: number;
        marketingProgress: number;
        learningProgress: number;
        customMetricData: Record<string, CustomMetricWeekData>;
        moodScore: number;
        isVacation: boolean;
        hasData: boolean;
        isFuture: boolean;
      }[];
    }[] = [];

    // Initialize 12 months
    for (let m = 0; m < 12; m++) {
      monthsData.push({ month: m, weeks: [] });
    }

    // Start from the first Monday of the year
    let currentWeekStart = new Date(yearStart);
    const jan1DayOfWeek = yearStart.getDay();
    if (jan1DayOfWeek !== 1) {
      // Move forward to first Monday
      const daysToAdd = jan1DayOfWeek === 0 ? 1 : 8 - jan1DayOfWeek;
      currentWeekStart.setDate(currentWeekStart.getDate() + daysToAdd);
    }

    while (currentWeekStart.getFullYear() === currentYear) {
      // Week belongs to the month that contains Monday
      const weekMonth = getMonth(currentWeekStart);

      // Get week totals
      const weekTotals = getWeekTotals(currentWeekStart);

      // Calculate progress for Golden Hours metrics (pro-rated for vacation days)
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

      // Calculate progress for each custom metric
      const customMetricData: Record<string, CustomMetricWeekData> = {};

      activeCustomMetrics.forEach((metric) => {
        let total = 0;

        // Get the total for this metric
        if (metric.isSystemMetric && metric.linkedField) {
          total = (weekTotals as any)[metric.linkedField] ?? 0;
        } else {
          total = weekTotals.customMetricTotals?.[metric.id] ?? 0;
        }

        // Calculate progress based on weekly goal (pro-rated for vacation days)
        let progress = 0;
        let excess = 0;

        if (isAllVacation) {
          progress = 1; // Full vacation week = goal met
        } else if (metric.weeklyGoal > 0) {
          const adjustedGoal = proRateGoal(metric.weeklyGoal, vacationDays);
          if (metric.category === 'negative') {
            // For limits, progress = actual / adjusted limit
            progress = adjustedGoal > 0 ? total / adjustedGoal : 0;
            excess = Math.max(0, total - adjustedGoal);
            // For minutes, convert excess to hours
            if (metric.unitType === 'minutes') {
              excess = Math.round(excess / 60);
            }
          } else {
            // For positive goals, progress = actual / adjusted goal
            progress = adjustedGoal > 0 ? total / adjustedGoal : 0;
          }
        } else if (total > 0) {
          progress = 1; // Show some progress if no goal but has data
        }

        customMetricData[metric.id] = { progress, excess };
      });

      const isFuture = isBefore(today, currentWeekStart);
      const hasData = weekTotals.daysLogged > 0;
      const isVacation = weekTotals.vacationDays > 0 && weekTotals.vacationDays >= weekTotals.daysLogged;

      // Add to the appropriate month
      monthsData[weekMonth].weeks.push({
        weekStart: new Date(currentWeekStart),
        weekNum: getWeek(currentWeekStart, { weekStartsOn: 1 }),
        buildingProgress,
        marketingProgress,
        learningProgress,
        customMetricData,
        moodScore: weekTotals.averageMood,
        isVacation,
        hasData,
        isFuture,
      });

      // Move to next Monday
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }

    return monthsData;
  }, [currentYear, getWeekTotals, goals, activeCustomMetrics]);

  // Get the correct number of weeks per month for this year
  const weeksPerMonth = useMemo(() => getWeeksPerMonth(currentYear), [currentYear]);

  // Find max weeks per month for column alignment (will be 4 or 5)
  const maxWeeksPerMonth = Math.max(...weeksPerMonth);

  const selectedMetricLabel = metricOptions.find(m => m.key === selectedMetric)?.label || 'Golden Hours';

  return (
    <View style={styles.container}>
      {/* Year and Metric Selector Header */}
      <View style={styles.header}>
        <Text style={styles.yearTitle}>{currentYear}</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <ChevronDown size={16} color={colors.purple[500]} style={styles.dropdownIcon} />
          <Text style={styles.dropdownText}>{selectedMetricLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <View style={styles.dropdownMenu}>
          {metricOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.dropdownItem,
                selectedMetric === option.key && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                setSelectedMetric(option.key);
                setDropdownOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedMetric === option.key && styles.dropdownItemTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Calendar Grid */}
      <ScrollView style={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {gridData.map((monthData) => (
          <View key={monthData.month} style={styles.monthRow}>
            {/* Month Label */}
            <Text style={styles.monthLabel}>{MONTH_LABELS[monthData.month]}</Text>

            {/* Week Cells */}
            <View style={styles.weeksContainer}>
              {monthData.weeks.slice(0, weeksPerMonth[monthData.month]).map((week, index) => (
                <WeekCell
                  key={`${monthData.month}-${index}`}
                  weekStart={week.weekStart}
                  selectedMetric={selectedMetric}
                  buildingProgress={week.buildingProgress}
                  marketingProgress={week.marketingProgress}
                  learningProgress={week.learningProgress}
                  customMetricData={week.customMetricData}
                  moodScore={week.moodScore}
                  isVacation={week.isVacation}
                  hasData={week.hasData}
                  isFuture={week.isFuture}
                  customMetrics={activeCustomMetrics}
                />
              ))}
              {/* Fill remaining cells with empty space for alignment when month has fewer weeks */}
              {Array.from({ length: maxWeeksPerMonth - weeksPerMonth[monthData.month] }).map((_, i) => (
                <View key={`spacer-${monthData.month}-${i}`} style={styles.weekCell} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  yearTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownIcon: {
    marginRight: 6,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    minWidth: 140,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: colors.purple[50],
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  dropdownItemTextSelected: {
    color: colors.purple[600],
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  gridContainer: {
    flex: 1,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  monthLabel: {
    width: 30,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  weeksContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: {
    backgroundColor: colors.purple[100],
  },
  vacationIcon: {
    width: 36,
    height: 36,
  },
  logoIcon: {
    width: 44,
    height: 44,
  },
  checkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitBreachedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitBreachedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.error,
    marginTop: -2,
  },
  moodCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  moodCircleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
