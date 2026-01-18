import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics, ANALYTICS_EVENTS } from '../lib/analytics';
import { colors } from '../constants/colors';
import type { ProgressTabType } from '../navigation/types';
import WeeklyProgress from '../components/progress/WeeklyProgress';
import CalendarView from '../components/progress/CalendarView';
import StatsView from '../components/progress/StatsView';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, isActive, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[
        styles.tabButton,
        isActive && styles.tabButtonActive,
      ]}
    >
      <Text
        style={[
          styles.tabButtonText,
          isActive && styles.tabButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<ProgressTabType>('week');
  const { trackScreen, trackEvent } = useAnalytics();

  useEffect(() => {
    trackScreen(ANALYTICS_EVENTS.SCREEN_PROGRESS);
  }, []);

  const handleTabChange = (tab: ProgressTabType) => {
    setActiveTab(tab);
    trackEvent(ANALYTICS_EVENTS.PROGRESS_VIEWED, { tab });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'week':
        return <WeeklyProgress />;
      case 'calendar':
        return <CalendarView />;
      case 'stats':
        return <StatsView />;
      default:
        return <WeeklyProgress />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('../../assets/tab_title.png')}
            style={styles.headerTitleImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          label="Week"
          isActive={activeTab === 'week'}
          onPress={() => handleTabChange('week')}
        />
        <TabButton
          label="Calendar"
          isActive={activeTab === 'calendar'}
          onPress={() => handleTabChange('calendar')}
        />
        <TabButton
          label="Stats"
          isActive={activeTab === 'stats'}
          onPress={() => handleTabChange('stats')}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitleImage: {
    width: 200,
    height: 48,
    maxWidth: '70%',
    alignSelf: 'flex-start',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.slate[100],
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.purple[600],
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
