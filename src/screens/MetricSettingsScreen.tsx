import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, METRICS, MetricKey } from '../constants/colors';
import { useMetricSettingsStore } from '../state/metricSettingsStore';
import { useGoalsStore } from '../state/goalsStore';
import {
  useCustomMetricsStore,
  formatMetricValue,
  getUnitLabel,
  getDefaultIncrement,
} from '../state/customMetricsStore';
import { MetricUnitType } from '../types';
import { RootStackParamList } from '../navigation/types';
import Stepper from '../components/ui/Stepper';

type MetricSettingsRouteProp = RouteProp<RootStackParamList, 'MetricSettings'>;

const TIME_INCREMENT_OPTIONS = [5, 10, 15, 30, 60];
const COUNT_INCREMENT_OPTIONS = [1, 2, 5];
const HOUR_INCREMENT_OPTIONS = [1, 2, 4];

export default function MetricSettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute<MetricSettingsRouteProp>();
  const { metricKey } = route.params;

  const { settings, updateSetting } = useMetricSettingsStore();
  const { goals, updateGoals } = useGoalsStore();
  const { metrics, updateMetric } = useCustomMetricsStore();
  const currentSetting = settings[metricKey];

  const customMetric = useMemo(
    () => metrics.find((m) => m.id === metricKey),
    [metrics, metricKey]
  );
  const metric = METRICS[metricKey as MetricKey];

  const unitType: MetricUnitType = useMemo(() => {
    if (customMetric?.unitType) return customMetric.unitType;
    if (metric?.type === 'time') return 'minutes';
    return 'count';
  }, [customMetric, metric]);

  const incrementOptions = useMemo(() => {
    switch (unitType) {
      case 'minutes':
        return TIME_INCREMENT_OPTIONS;
      case 'hours':
        return HOUR_INCREMENT_OPTIONS;
      case 'boolean':
        return [1];
      case 'count':
      default:
        return COUNT_INCREMENT_OPTIONS;
    }
  }, [unitType]);

  const fallbackIncrement = useMemo(() => {
    if (customMetric) return getDefaultIncrement(unitType);
    return metric?.increment ?? 1;
  }, [customMetric, metric, unitType]);

  const [increment, setIncrement] = useState(currentSetting?.increment ?? fallbackIncrement);
  const [defaultValue, setDefaultValue] = useState(currentSetting?.defaultValue ?? 0);

  const isTimeMetric = metric?.type === 'time' || unitType === 'minutes' || unitType === 'hours';

  useEffect(() => {
    setIncrement(currentSetting?.increment ?? fallbackIncrement);
    setDefaultValue(currentSetting?.defaultValue ?? 0);
  }, [currentSetting, fallbackIncrement]);

  const handleIncrementSelect = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIncrement(value);
    updateSetting(metricKey, { increment: value });
  };

  const handleDefaultValueChange = (value: number) => {
    setDefaultValue(value);
    updateSetting(metricKey, { defaultValue: value });
  };

  const formatValue = (value: number) => {
    if (customMetric) {
      return formatMetricValue(value, unitType);
    }
    if (!isTimeMetric) return `${value}`;
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatIncrement = (value: number) => {
    switch (unitType) {
      case 'minutes':
        return value >= 60 ? `${value / 60} hr` : `${value} min`;
      case 'hours':
        return `${value} hr`;
      case 'boolean':
        return `${value} day`;
      case 'count':
      default:
        return `${value} count`;
    }
  };

  const weeklyGoalConfig = useMemo(() => {
    if (customMetric) {
      const incrementValue = customMetric.unitType === 'minutes' ? 15 : 1;
      const maxValue = customMetric.unitType === 'minutes'
        ? 600
        : customMetric.unitType === 'hours'
          ? 40
          : customMetric.unitType === 'boolean'
            ? 7
            : 50;

      return {
        value: customMetric.weeklyGoal ?? 0,
        increment: incrementValue,
        max: maxValue,
        label: customMetric.category === 'negative' ? 'Weekly Limit' : 'Weekly Goal',
        unitLabel: getUnitLabel(customMetric.unitType),
        formatValue: (value: number) => {
          if (customMetric.unitType === 'minutes') {
            return formatMetricValue(value, 'minutes');
          }
          if (customMetric.unitType === 'hours') {
            return `${value} hrs`;
          }
          if (customMetric.unitType === 'boolean') {
            return `${value} days`;
          }
          return `${value}`;
        },
        onChange: (value: number) => updateMetric(customMetric.id, { weeklyGoal: value }),
      };
    }

    if (metricKey === 'building' || metricKey === 'marketing' || metricKey === 'levelingUp') {
      const goalKeyMap = {
        building: 'buildingHours',
        marketing: 'marketingHours',
        levelingUp: 'levelingUpHours',
      } as const;

      const goalKey = goalKeyMap[metricKey as keyof typeof goalKeyMap];

      return {
        value: goals[goalKey] ?? 0,
        increment: 1,
        max: 40,
        label: 'Weekly Goal',
        unitLabel: 'hrs/week',
        formatValue: (value: number) => `${value} hrs`,
        onChange: (value: number) => updateGoals({ [goalKey]: value }),
      };
    }

    return null;
  }, [customMetric, goals, metricKey, updateGoals, updateMetric]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{customMetric?.name || metric?.label || 'Metric'} Settings</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Increment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Increment</Text>
          <Text style={styles.sectionDescription}>
            How much to add/subtract when tapping +/-
          </Text>
          <View style={styles.optionsRow}>
            {incrementOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  increment === option && styles.optionButtonSelected,
                ]}
                onPress={() => handleIncrementSelect(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    increment === option && styles.optionTextSelected,
                  ]}
                >
                  {formatIncrement(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Value Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Default</Text>
          <Text style={styles.sectionDescription}>
            Starting value for each new day
          </Text>
          <View style={styles.stepperRow}>
            <Stepper
              value={defaultValue}
              onChange={handleDefaultValueChange}
              increment={increment}
              min={0}
              formatValue={formatValue}
            />
          </View>
        </View>

        {/* Weekly Goal Section */}
        {weeklyGoalConfig && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{weeklyGoalConfig.label}</Text>
            <Text style={styles.sectionDescription}>
              Set your weekly target ({weeklyGoalConfig.unitLabel})
            </Text>
            <View style={styles.stepperRow}>
              <Stepper
                value={weeklyGoalConfig.value}
                onChange={weeklyGoalConfig.onChange}
                increment={weeklyGoalConfig.increment}
                min={0}
                max={weeklyGoalConfig.max}
                formatValue={weeklyGoalConfig.formatValue}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.slate[100],
    minWidth: 60,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.purple[500],
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  stepperRow: {
    alignItems: 'flex-start',
  },
});
