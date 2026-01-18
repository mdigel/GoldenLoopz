import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLogStore } from '../state/logStore';
import { useGoalsStore } from '../state/goalsStore';
import { useStreakStore } from '../state/streakStore';
import { useMetricSettingsStore } from '../state/metricSettingsStore';
import { useCustomMetricsStore, getMetricValue, setMetricValue, formatMetricValue, getDefaultIncrement } from '../state/customMetricsStore';
import { useAnalytics, ANALYTICS_EVENTS } from '../lib/analytics';
import { CustomMetric, SYSTEM_METRIC_IDS } from '../types';
import { formatDisplayDate, getToday, formatDate } from '../lib/dateUtils';
import { METRICS } from '../constants/colors';
import { colors } from '../constants/colors';
import { WeekCalendarStrip } from '../components/ui/WeekCalendarStrip';
import { MoodScale } from '../components/ui/MoodScale';
import { MetricRing } from '../components/log/MetricRing';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { InfoModal, InfoText, InfoBold, InfoBullet, InfoSubBullet } from '../components/ui/InfoModal';
import Stepper from '../components/ui/Stepper';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function LogScreen() {
  const { trackScreen } = useAnalytics();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const previousDateRef = useRef<Date>(selectedDate);

  // Reanimated values for card slide animation
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dateString = formatDate(selectedDate);
  const logs = useLogStore((state) => state.logs);
  const updateLog = useLogStore((state) => state.updateLog);
  const recordLogEntry = useStreakStore((state) => state.recordLogEntry);
  const goals = useGoalsStore((state) => state.goals);
  const metricSettings = useMetricSettingsStore((state) => state.settings);
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const activeCustomMetrics = useMemo(() => customMetrics.filter(m => m.isActive), [customMetrics]);

  const log = useMemo(() => {
    return logs[dateString] || {
      date: dateString,
      buildingMinutes: 0,
      marketingMinutes: 0,
      levelingUpMinutes: 0,
      workoutMinutes: 0,
      drinks: 0,
      tvMinutes: 0,
      moodScore: 50,
      reflection: '',
      isVacation: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [logs, dateString]);

  useEffect(() => {
    trackScreen(ANALYTICS_EVENTS.SCREEN_LOG);
  }, []);

  // Animate content when date changes - horizontal slide animation
  const handleDateSelect = useCallback((date: Date) => {
    const prevDate = previousDateRef.current;

    // Skip if same date
    if (date.getTime() === prevDate.getTime()) return;

    // Direction: future = slide left (-1), past = slide right (+1)
    const isGoingToFuture = date.getTime() > prevDate.getTime();
    const exitDirection = isGoingToFuture ? -1 : 1;

    const SLIDE_DISTANCE = 50;
    const HALF_DURATION = 110;

    // Phase 1: Slide out + fade
    translateX.value = withTiming(exitDirection * SLIDE_DISTANCE, {
      duration: HALF_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0.2, {
      duration: HALF_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    // Update state
    setSelectedDate(date);
    previousDateRef.current = date;

    // Phase 2: Slide in from opposite side
    setTimeout(() => {
      translateX.value = -exitDirection * SLIDE_DISTANCE;
      translateX.value = withTiming(0, {
        duration: HALF_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: HALF_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }, HALF_DURATION);
  }, []);

  const handleVacationToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateLog(dateString, { isVacation: !log.isVacation });
  }, [dateString, updateLog, log.isVacation]);

  const handleMetricChange = useCallback(
    (key: string, value: number) => {
      updateLog(dateString, { [key]: value });

      if (key === 'buildingMinutes' && value > 0) {
        recordLogEntry(dateString, true);
      }
    },
    [dateString, updateLog, recordLogEntry]
  );

  const handleCustomMetricChange = useCallback(
    (metric: CustomMetric, value: number) => {
      const updates = setMetricValue(metric, log, value);
      updateLog(dateString, updates);
    },
    [dateString, updateLog, log]
  );

  const handleMoodChange = useCallback(
    (value: number) => {
      // Convert 1-10 scale to 0-100 for storage
      const scaledValue = (value - 1) * (100 / 9);
      updateLog(dateString, { moodScore: Math.round(scaledValue) });
    },
    [dateString, updateLog]
  );

  const handleReflectionChange = useCallback(
    (value: string) => {
      updateLog(dateString, { reflection: value });
      recordLogEntry(dateString, log.buildingMinutes > 0);
    },
    [dateString, updateLog, recordLogEntry, log.buildingMinutes]
  );

  // Convert stored 0-100 mood to 1-10 scale
  const moodValue = Math.round((log.moodScore / 100) * 9) + 1;

  // Calculate progress for main metrics (weekly goals in hours, logs in minutes)
  const buildingProgress = goals.buildingHours > 0
    ? log.buildingMinutes / (goals.buildingHours * 60)
    : 0;
  const marketingProgress = goals.marketingHours > 0
    ? log.marketingMinutes / (goals.marketingHours * 60)
    : 0;
  const learningProgress = goals.levelingUpHours > 0
    ? log.levelingUpMinutes / (goals.levelingUpHours * 60)
    : 0;

  const getSystemMetricImage = (id: string) => {
    switch (id) {
      case SYSTEM_METRIC_IDS.EXERCISE:
        return require('../../assets/dumbell.png');
      case SYSTEM_METRIC_IDS.DRINKS:
        return require('../../assets/wine.png');
      case SYSTEM_METRIC_IDS.STREAMING:
        return require('../../assets/tv.png');
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/tab_title.png')}
              style={styles.headerTitleImage}
              resizeMode="contain"
            />
          </View>

          {/* Week Calendar Strip */}
          <WeekCalendarStrip
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          {/* Animated Card */}
          <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
            {/* Main Metrics Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Golden Hours</Text>
              <TouchableOpacity
                style={styles.settingsIcon}
                onPress={() => navigation.navigate('MetricSettings', { metricKey: 'building' })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Settings size={18} color={colors.text.muted} />
              </TouchableOpacity>
              <InfoModal title="Golden Hours">
                <InfoText>
                  The specific, dedicated time slots you identify in your week to work on your internet business, typically outside of your 9-to-5 job and other essential life responsibilities.
                </InfoText>
                <InfoBullet>
                  <InfoBold>Goal:</InfoBold> The goal is to find 10-15 hours per week (or start with 5 hours) to dedicate to your business.
                </InfoBullet>
                <InfoBullet>
                  <InfoBold>Examples:</InfoBold>
                </InfoBullet>
                <InfoSubBullet>6-9 PM after work.</InfoSubBullet>
                <InfoSubBullet>6-10 PM on Monday and Tuesday evenings as non-negotiable business time.</InfoSubBullet>
                <InfoBullet>
                  <InfoBold>Purpose:</InfoBold> The concept emphasizes being intentional with your time rather than trying to optimize every minute or risking burnout. It's about finding time when you feel energized.
                </InfoBullet>
              </InfoModal>
            </View>

            <View style={styles.metricsRow}>
              <MetricRing
                metricKey="building"
                value={log.buildingMinutes}
                goal={goals.buildingHours * 60}
                onIncrement={() =>
                  handleMetricChange(
                    'buildingMinutes',
                    log.buildingMinutes + (metricSettings.building?.increment || METRICS.building.increment)
                  )
                }
                onDecrement={() =>
                  handleMetricChange(
                    'buildingMinutes',
                    Math.max(0, log.buildingMinutes - (metricSettings.building?.increment || METRICS.building.increment))
                  )
                }
              />

              <MetricRing
                metricKey="marketing"
                value={log.marketingMinutes}
                goal={goals.marketingHours * 60}
                onIncrement={() =>
                  handleMetricChange(
                    'marketingMinutes',
                    log.marketingMinutes + (metricSettings.marketing?.increment || METRICS.marketing.increment)
                  )
                }
                onDecrement={() =>
                  handleMetricChange(
                    'marketingMinutes',
                    Math.max(0, log.marketingMinutes - (metricSettings.marketing?.increment || METRICS.marketing.increment))
                  )
                }
              />

              <MetricRing
                metricKey="levelingUp"
                value={log.levelingUpMinutes}
                goal={goals.levelingUpHours * 60}
                onIncrement={() =>
                  handleMetricChange(
                    'levelingUpMinutes',
                    log.levelingUpMinutes + (metricSettings.levelingUp?.increment || METRICS.levelingUp.increment)
                  )
                }
                onDecrement={() =>
                  handleMetricChange(
                    'levelingUpMinutes',
                    Math.max(0, log.levelingUpMinutes - (metricSettings.levelingUp?.increment || METRICS.levelingUp.increment))
                  )
                }
              />
            </View>
          </View>

          {/* Other Inputs Section - Dynamic Custom Metrics */}
          {activeCustomMetrics.length > 0 && (
            <View style={styles.section}>
              {activeCustomMetrics.map((metric) => {
                const value = getMetricValue(metric, log);
                const increment =
                  metricSettings[metric.id]?.increment ?? getDefaultIncrement(metric.unitType);
                const hasMetricIcon = metric.isSystemMetric && getSystemMetricImage(metric.id);

                return (
                  <View key={metric.id} style={styles.inputRow}>
                    <View style={[styles.inputLabel, !hasMetricIcon && styles.inputLabelNoIcon]}>
                      <View style={[styles.inputTitleRow, !hasMetricIcon && styles.inputTitleRowNoIcon]}>
                        {hasMetricIcon && (
                          <Image
                            source={getSystemMetricImage(metric.id)}
                            style={styles.inputMetricIcon}
                            resizeMode="contain"
                          />
                        )}
                        <Text
                          style={[styles.inputTitle, !hasMetricIcon && styles.inputTitleNoIcon]}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {metric.name}
                        </Text>
                        <InfoTooltip text={metric.description} />
                      </View>
                    </View>
                    <View style={styles.inputStepper}>
                      <Stepper
                        value={value}
                        onChange={(v) => handleCustomMetricChange(metric, v)}
                        increment={increment}
                        min={0}
                        formatValue={(v) => formatMetricValue(v, metric.unitType)}
                        buttonSize={42}
                        iconSize={20}
                        valueMinWidth={44}
                        valueMarginHorizontal={6}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.rowSettingsIcon}
                      onPress={() => navigation.navigate('MetricSettings', { metricKey: metric.id })}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Settings size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Mood Section */}
          <View style={styles.section}>
            <MoodScale
              value={moodValue}
              onChange={handleMoodChange}
              label="Mood"
            />
          </View>

          {/* Reflection Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder="What did you accomplish today? Any wins or learnings?"
              placeholderTextColor={colors.text.muted}
              value={log.reflection}
              onChangeText={handleReflectionChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Vacation Toggle */}
          <TouchableOpacity
            style={styles.vacationToggle}
            onPress={handleVacationToggle}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/palm-tree.png')}
              style={[
                styles.vacationIcon,
                !log.isVacation && styles.vacationIconInactive,
              ]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.vacationText,
                log.isVacation && styles.vacationTextActive,
              ]}
            >
              {log.isVacation ? 'Vacation Day' : 'Mark as vacation day'}
            </Text>
          </TouchableOpacity>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  cardContainer: {
    marginTop: 12,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLogo: {
    width: 56,
    height: 56,
    marginRight: 4,
    borderWidth: 2,
    borderColor: 'red',
  },
  headerTitleImage: {
    width: 200,
    height: 48,
    maxWidth: '70%',
    alignSelf: 'flex-start',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingsIcon: {
    marginLeft: 8,
    padding: 4,
  },
  rowSettingsIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  inputLabel: {
    width: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabelNoIcon: {
    alignItems: 'flex-end',
  },
  inputTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputTitleRowNoIcon: {
    justifyContent: 'flex-end',
  },
  inputMetricIcon: {
    width: 22,
    height: 22,
    marginRight: 6,
  },
  inputStepper: {
    alignItems: 'flex-start',
    paddingLeft: 12,
    justifyContent: 'center',
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  inputTitleNoIcon: {
    textAlign: 'right',
  },
  reflectionInput: {
    backgroundColor: colors.slate[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 100,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },
  vacationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  vacationIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  vacationIconInactive: {
    opacity: 0.4,
  },
  vacationText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  vacationTextActive: {
    color: colors.gold[600],
    fontWeight: '600',
  },
});
