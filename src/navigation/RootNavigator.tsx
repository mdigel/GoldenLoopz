import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import DayDetailScreen from '../screens/DayDetailScreen';
import MetricSettingsScreen from '../screens/MetricSettingsScreen';
import GoldenHoursSettingsScreen from '../screens/GoldenHoursSettingsScreen';
import GoldenHoursGoalsScreen from '../screens/GoldenHoursGoalsScreen';
import CustomMetricsScreen from '../screens/CustomMetricsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import MeetMidasScreen from '../screens/MeetMidasScreen';
import { useOnboardingStore } from '../state/onboardingStore';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <OnboardingNavigator />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Day Details',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
        }}
      />
      <Stack.Screen
        name="MetricSettings"
        component={MetricSettingsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GoldenHoursSettings"
        component={GoldenHoursSettingsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GoldenHoursGoals"
        component={GoldenHoursGoalsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Golden Hours Goals',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
        }}
      />
      <Stack.Screen
        name="CustomMetrics"
        component={CustomMetricsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Custom Metrics',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          headerShown: true,
          headerTitle: 'Send Feedback',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
        }}
      />
      <Stack.Screen
        name="MeetMidas"
        component={MeetMidasScreen}
        options={{
          headerShown: true,
          headerTitle: 'Meet Midas',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text.primary,
        }}
      />
    </Stack.Navigator>
  );
}
