import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, RotateCcw, Play, Database, Trash2 } from 'lucide-react-native';
import { InfoModal, InfoText, InfoBold, InfoBullet } from '../components/ui/InfoModal';
import { useGoalsStore } from '../state/goalsStore';
import { useOnboardingStore } from '../state/onboardingStore';
import { useLogStore } from '../state/logStore';
import { useCustomMetricsStore } from '../state/customMetricsStore';
import { useAnalytics, ANALYTICS_EVENTS } from '../lib/analytics';
import { exportLogsAsCsv } from '../lib/csvExport';
import { useWeeklyReportStore } from '../state/weeklyReportStore';
import { colors } from '../constants/colors';

interface MenuItemProps {
  label: string;
  iconSource?: number;
  onPress: () => void;
}

function MenuItem({ label, iconSource, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuItemLeft}>
        {iconSource && (
          <Image source={iconSource} style={styles.menuItemIcon} resizeMode="contain" />
        )}
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <ChevronRight size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { trackScreen } = useAnalytics();
  const navigation = useNavigation();
  const vacationMode = useGoalsStore((state) => state.vacationMode);
  const toggleVacationMode = useGoalsStore((state) => state.toggleVacationMode);
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const logs = useLogStore((state) => state.logs);
  const loadDemoData = useLogStore((state) => state.loadDemoData);
  const clearDemoData = useLogStore((state) => state.clearDemoData);
  const customMetrics = useCustomMetricsStore((state) => state.metrics);
  const forceShowWeeklyReport = useWeeklyReportStore((state) => state.forceShow);
  const hasDemoData = Object.keys(logs).length > 0;

  useEffect(() => {
    trackScreen(ANALYTICS_EVENTS.SCREEN_PROFILE);
  }, []);

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again. Your data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: resetOnboarding },
      ]
    );
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        <View style={styles.card}>
          <MenuItem
            label="Meet Midas"
            iconSource={require('../../Logo_Ourofox.png')}
            onPress={() => navigation.navigate('MeetMidas')}
          />
          <View style={styles.separator} />
          <MenuItem
            label="Golden Hours Goals"
            iconSource={require('../../assets/Gold_Bar.png')}
            onPress={() => navigation.navigate('GoldenHoursGoals')}
          />
          <View style={styles.separator} />
          <MenuItem
            label="Custom Metrics"
            onPress={() => navigation.navigate('CustomMetrics')}
          />
          <View style={styles.separator} />
          <MenuItem
            label="Export Data"
            onPress={() => exportLogsAsCsv(logs, customMetrics)}
          />
          <View style={styles.separator} />
          <MenuItem
            label="Send Feedback"
            onPress={() => navigation.navigate('Feedback')}
          />
        </View>

        {/* Vacation Mode */}
        <View style={styles.card}>
          <View style={styles.vacationRow}>
            <View style={styles.vacationInfo}>
              <View style={styles.vacationTitleRow}>
                <Image
                  source={require('../../assets/palm-tree.png')}
                  style={styles.vacationIcon}
                  resizeMode="contain"
                />
                <Text style={styles.vacationTitle}>Vacation Mode</Text>
                <InfoModal title="Vacation Mode">
                  <InfoText>
                    Take time off guilt-free. Your goals and stats automatically adjust so vacation days never count against you.
                  </InfoText>
                  <InfoBullet>
                    <InfoBold>Goals scale down</InfoBold> — 2 vacation days means your weekly targets drop to 5/7.
                  </InfoBullet>
                  <InfoBullet>
                    <InfoBold>Averages stay fair</InfoBold> — vacation days are excluded from weekly average calculations.
                  </InfoBullet>
                  <InfoBullet>
                    <InfoBold>Nothing breaks</InfoBold> — progress rings, calendar, and streaks all account for time off.
                  </InfoBullet>
                </InfoModal>
              </View>
            </View>
            <Switch
              value={vacationMode.isActive}
              onValueChange={toggleVacationMode}
              trackColor={{ false: colors.slate[200], true: colors.purple[300] }}
              thumbColor={vacationMode.isActive ? colors.purple[500] : colors.slate[400]}
            />
          </View>
          {vacationMode.isActive && (
            <View style={styles.vacationActiveIndicator}>
              <Text style={styles.vacationActiveText}>
                Vacation mode is active - streaks are paused
              </Text>
            </View>
          )}
        </View>

        {/* Dev Tools */}
        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devSectionTitle}>Dev Tools</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => { loadDemoData(); Alert.alert('Demo Data Loaded', '60 days of sample data has been added.'); }}
              activeOpacity={0.7}
            >
              <Database size={18} color={colors.text.muted} />
              <Text style={styles.resetText}>Load Demo Data</Text>
            </TouchableOpacity>
            {hasDemoData && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  Alert.alert('Clear All Data', 'This will remove all log entries.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: () => { clearDemoData(); Alert.alert('Data Cleared'); } },
                  ]);
                }}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color={colors.text.muted} />
                <Text style={styles.resetText}>Clear All Data</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={forceShowWeeklyReport}
              activeOpacity={0.7}
            >
              <Play size={18} color={colors.text.muted} />
              <Text style={styles.resetText}>Simulate Weekly Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetOnboarding}
              activeOpacity={0.7}
            >
              <RotateCcw size={18} color={colors.text.muted} />
              <Text style={styles.resetText}>Reset Onboarding</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Golden Loopz v1.0.0</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.slate[100],
    marginHorizontal: 16,
  },
  vacationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  vacationInfo: {
    flex: 1,
    marginRight: 16,
  },
  vacationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vacationIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  vacationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  vacationActiveIndicator: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.purple[50],
    borderRadius: 8,
  },
  vacationActiveText: {
    fontSize: 14,
    color: colors.purple[600],
    textAlign: 'center',
  },
  devSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 8,
  },
  devSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  resetText: {
    fontSize: 14,
    color: colors.text.muted,
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  bottomSpacer: {
    height: 32,
  },
});
