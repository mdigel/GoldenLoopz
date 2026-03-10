import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGoalsStore } from '../state/goalsStore';
import { useAnalytics, ANALYTICS_EVENTS } from '../lib/analytics';
import { colors } from '../constants/colors';
import Button from '../components/ui/Button';

interface GoalInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  description?: string;
  iconSource?: number;
}

function GoalInput({ label, value, onChange, suffix, description, iconSource }: GoalInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (text: string) => {
    setInputValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    }
  };

  return (
    <View style={styles.goalInput}>
      <View style={styles.goalLabelRow}>
        {iconSource && (
          <Image source={iconSource} style={styles.goalLabelIcon} resizeMode="contain" />
        )}
        <Text style={styles.goalLabel}>{label}</Text>
      </View>
      {description && <Text style={styles.goalDescription}>{description}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          value={inputValue}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          style={styles.textInput}
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

export default function GoldenHoursGoalsScreen() {
  const { trackEvent } = useAnalytics();
  const goals = useGoalsStore((state) => state.goals);
  const updateGoals = useGoalsStore((state) => state.updateGoals);

  const [localGoals, setLocalGoals] = useState(goals);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const handleGoalChange = (key: keyof typeof goals, value: number) => {
    setLocalGoals((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateGoals(localGoals);
    trackEvent(ANALYTICS_EVENTS.GOAL_UPDATED, {
      building_hours: localGoals.buildingHours,
      marketing_hours: localGoals.marketingHours,
      leveling_up_hours: localGoals.levelingUpHours,
      workout_count: localGoals.workoutCount,
    });
    setHasChanges(false);
    Alert.alert('Success', 'Goals saved successfully!');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../../assets/Gold_Bar.png')}
              style={styles.sectionIcon}
              resizeMode="contain"
            />
            <Text style={styles.sectionTitle}>Golden Hours</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Your core productivity metrics for building, marketing, and learning
          </Text>

          <GoalInput
            label="Marketing"
            value={localGoals.marketingHours}
            onChange={(v) => handleGoalChange('marketingHours', v)}
            suffix="hours/week"
            description="Distribution, writing, outreach, audience growth"
            iconSource={require('../../assets/megaphone.png')}
          />

          <GoalInput
            label="Building"
            value={localGoals.buildingHours}
            onChange={(v) => handleGoalChange('buildingHours', v)}
            suffix="hours/week"
            description="Creating products, writing code, designing"
            iconSource={require('../../assets/pickaxe.png')}
          />

          <GoalInput
            label="Learning"
            value={localGoals.levelingUpHours}
            onChange={(v) => handleGoalChange('levelingUpHours', v)}
            suffix="hours/week"
            description="Learning, reading, courses, tutorials"
            iconSource={require('../../assets/goldenyoutube.png')}
          />
        </View>
      </ScrollView>

      {hasChanges && (
        <View style={styles.stickySaveContainer}>
          <Button title="Save Goals" onPress={handleSave} style={styles.stickySaveButton} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  goalInput: {
    marginBottom: 16,
  },
  goalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLabelIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
    color: colors.text.primary,
  },
  suffix: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
  },
  stickySaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  stickySaveButton: {
    marginBottom: 0,
  },
});
