import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../constants/colors';
import LogScreen from '../screens/LogScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WeeklySummaryModal from '../components/WeeklySummaryModal';
import { useWeeklyReportStore } from '../state/weeklyReportStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const checkAndShow = useWeeklyReportStore((s) => s.checkAndShow);

  useEffect(() => {
    checkAndShow();
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <WeeklySummaryModal />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold[600],
        tabBarInactiveTintColor: colors.slate[400],
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="LogTab"
        component={LogScreen}
        options={{
          tabBarLabel: 'Log',
          tabBarIcon: ({ size }) => <Image source={require('../../assets/pencil.png')} style={{ width: size, height: size }} resizeMode="contain" />,
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ size }) => <Image source={require('../../assets/chart.png')} style={{ width: size, height: size }} resizeMode="contain" />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ size }) => <Image source={require('../../assets/profile.png')} style={{ width: size, height: size }} resizeMode="contain" />,
        }}
      />
    </Tab.Navigator>
    </View>
  );
}
