import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  WelcomeScreen,
  SparknotesScreen,
  GoldenHoursIntroScreen,
  GoldenHoursScreen,
  MetricsIntroScreen,
  MetricsScreen,
  DataExportScreen,
} from '../screens/onboarding';
import { useOnboardingStore } from '../state/onboardingStore';
import { useGoalsStore } from '../state/goalsStore';
import { useCustomMetricsStore } from '../state/customMetricsStore';
import { colors } from '../constants/colors';

type OnboardingStep =
  | 'welcome'
  | 'sparknotes'
  | 'goldenHoursIntro'
  | 'goldenHours'
  | 'metricsIntro'
  | 'metrics'
  | 'dataExport';

export default function OnboardingNavigator() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const recordGoalSnapshot = useGoalsStore((state) => state.recordGoalSnapshot);
  const customMetrics = useCustomMetricsStore((state) => state.metrics);

  const handleFinishOnboarding = () => {
    // Record initial goal snapshot with onboarding goals
    const customMetricGoals: Record<string, number> = {};
    customMetrics.filter(m => m.isActive).forEach(m => {
      customMetricGoals[m.id] = m.weeklyGoal;
    });
    recordGoalSnapshot(customMetricGoals);
    completeOnboarding();
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onNext={() => setCurrentStep('sparknotes')} />;
      case 'sparknotes':
        return (
          <SparknotesScreen
            onNext={() => setCurrentStep('goldenHoursIntro')}
            onBack={() => setCurrentStep('welcome')}
          />
        );
      case 'goldenHoursIntro':
        return (
          <GoldenHoursIntroScreen
            onNext={() => setCurrentStep('goldenHours')}
            onBack={() => setCurrentStep('sparknotes')}
          />
        );
      case 'goldenHours':
        return (
          <GoldenHoursScreen
            onNext={() => setCurrentStep('metricsIntro')}
            onBack={() => setCurrentStep('goldenHoursIntro')}
          />
        );
      case 'metricsIntro':
        return (
          <MetricsIntroScreen
            onNext={() => setCurrentStep('metrics')}
            onBack={() => setCurrentStep('goldenHours')}
          />
        );
      case 'metrics':
        return (
          <MetricsScreen
            onFinish={() => setCurrentStep('dataExport')}
            onBack={() => setCurrentStep('metricsIntro')}
          />
        );
      case 'dataExport':
        return (
          <DataExportScreen
            onFinish={handleFinishOnboarding}
            onBack={() => setCurrentStep('metrics')}
          />
        );
      default:
        return <WelcomeScreen onNext={() => setCurrentStep('sparknotes')} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
