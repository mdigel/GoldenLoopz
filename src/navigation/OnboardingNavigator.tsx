import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  WelcomeScreen,
  SparknotesScreen,
  GoldenHoursIntroScreen,
  GoldenHoursScreen,
  MetricsIntroScreen,
  MetricsScreen,
} from '../screens/onboarding';
import { useOnboardingStore } from '../state/onboardingStore';
import { colors } from '../constants/colors';

type OnboardingStep =
  | 'welcome'
  | 'sparknotes'
  | 'goldenHoursIntro'
  | 'goldenHours'
  | 'metricsIntro'
  | 'metrics';

export default function OnboardingNavigator() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  const handleFinishOnboarding = () => {
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
            onFinish={handleFinishOnboarding}
            onBack={() => setCurrentStep('metricsIntro')}
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
