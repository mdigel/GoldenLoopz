import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, METRICS } from '../constants/colors';
import { useMetricSettingsStore } from '../state/metricSettingsStore';
import { useGoalsStore } from '../state/goalsStore';
import Stepper from '../components/ui/Stepper';

const TIME_INCREMENT_OPTIONS = [5, 10, 15, 30, 60];

const GOLDEN_METRICS = [
  { key: 'marketing', label: 'Marketing', goalKey: 'marketingHours' as const, icon: require('../../assets/megaphone.png') },
  { key: 'building', label: 'Building', goalKey: 'buildingHours' as const, icon: require('../../assets/pickaxe.png') },
  { key: 'levelingUp', label: 'Learning', goalKey: 'levelingUpHours' as const, icon: require('../../assets/goldenyoutube.png') },
] as const;

function formatTime(value: number) {
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatIncrement(value: number) {
  return value >= 60 ? `${value / 60} hr` : `${value} min`;
}

export default function GoldenHoursSettingsScreen() {
  const navigation = useNavigation();
  const { settings, updateSetting } = useMetricSettingsStore();
  const { goals, updateGoals } = useGoalsStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Golden Hours Settings</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {GOLDEN_METRICS.map((metric, index) => {
          const currentIncrement =
            settings[metric.key]?.increment ?? METRICS[metric.key].increment;
          const currentDefault = settings[metric.key]?.defaultValue ?? 0;
          const currentGoal = goals[metric.goalKey] ?? 0;

          return (
            <View key={metric.key}>
              {index > 0 && <View style={styles.metricDivider} />}
              <View style={styles.metricSection}>
                <View style={styles.metricTitleRow}>
                  <Image source={metric.icon} style={styles.metricIcon} resizeMode="contain" />
                  <Text style={styles.metricTitle}>{metric.label}</Text>
                </View>

                {/* Increment */}
                <Text style={styles.sectionLabel}>Increment</Text>
                <View style={styles.optionsRow}>
                  {TIME_INCREMENT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        currentIncrement === option && styles.optionButtonSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateSetting(metric.key, { increment: option });
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          currentIncrement === option && styles.optionTextSelected,
                        ]}
                      >
                        {formatIncrement(option)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Default Value */}
                <Text style={styles.sectionLabel}>Daily Default</Text>
                <View style={styles.stepperRow}>
                  <Stepper
                    value={currentDefault}
                    onChange={(v) => updateSetting(metric.key, { defaultValue: v })}
                    increment={currentIncrement}
                    min={0}
                    formatValue={formatTime}
                  />
                </View>

                {/* Weekly Goal */}
                <Text style={styles.sectionLabel}>Weekly Goal</Text>
                <View style={styles.stepperRow}>
                  <Stepper
                    value={currentGoal}
                    onChange={(v) => updateGoals({ [metric.goalKey]: v })}
                    increment={1}
                    min={0}
                    max={40}
                    formatValue={(v) => `${v} hrs`}
                  />
                </View>
              </View>
            </View>
          );
        })}
        <View style={styles.bottomSpacer} />
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
  metricSection: {
    paddingVertical: 16,
  },
  metricDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.slate[100],
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.purple[500],
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  stepperRow: {
    alignItems: 'flex-start',
  },
  bottomSpacer: {
    height: 32,
  },
});
