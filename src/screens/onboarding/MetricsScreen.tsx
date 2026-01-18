import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useCustomMetricsStore, getUnitLabel } from '../../state/customMetricsStore';
import { SYSTEM_METRIC_IDS } from '../../types';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';

interface MetricsScreenProps {
  onFinish: () => void;
  onBack: () => void;
}

const getMetricIcon = (id: string) => {
  switch (id) {
    case SYSTEM_METRIC_IDS.EXERCISE:
      return <Image source={require('../../../assets/dumbell.png')} style={styles.metricImage} resizeMode="contain" />;
    case SYSTEM_METRIC_IDS.DRINKS:
      return <Image source={require('../../../assets/wine.png')} style={styles.metricImage} resizeMode="contain" />;
    case SYSTEM_METRIC_IDS.STREAMING:
      return <Image source={require('../../../assets/tv.png')} style={styles.metricImage} resizeMode="contain" />;
    default:
      return null;
  }
};

const getIconBgColor = (id: string) => {
  switch (id) {
    case SYSTEM_METRIC_IDS.EXERCISE:
      return colors.purple[50];
    case SYSTEM_METRIC_IDS.DRINKS:
      return colors.gold[50];
    case SYSTEM_METRIC_IDS.STREAMING:
      return colors.gold[50];
    default:
      return colors.slate[100];
  }
};

const formatGoalValue = (value: number, unitType: string) => {
  if (unitType === 'minutes') {
    if (value >= 60) {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${value}m`;
  }
  return `${value}`;
};

export default function MetricsScreen({ onFinish, onBack }: MetricsScreenProps) {
  const { metrics, toggleMetric, updateMetric } = useCustomMetricsStore();

  // Get only system metrics for this screen
  const systemMetrics = metrics.filter((m) => m.isSystemMetric);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track More</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Custom Metrics</Text>

        {systemMetrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIcon, { backgroundColor: getIconBgColor(metric.id) }]}>
                {getMetricIcon(metric.id)}
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={styles.metricDescription}>{metric.description}</Text>
              </View>
              <Switch
                value={metric.isActive}
                onValueChange={() => toggleMetric(metric.id)}
                trackColor={{ false: colors.slate[200], true: colors.purple[300] }}
                thumbColor={metric.isActive ? colors.purple[500] : colors.slate[400]}
              />
            </View>

            {metric.isActive && (
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>
                  Weekly {metric.category === 'negative' ? 'limit' : 'goal'}
                </Text>
                <Stepper
                  value={metric.weeklyGoal}
                  onChange={(value) => updateMetric(metric.id, { weeklyGoal: value })}
                  increment={metric.unitType === 'minutes' ? 15 : 1}
                  min={0}
                  max={metric.unitType === 'minutes' ? 600 : 50}
                  formatValue={(v) => formatGoalValue(v, metric.unitType)}
                />
              </View>
            )}
          </View>
        ))}

      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Tracking"
          onPress={onFinish}
          style={styles.ctaButton}
          textStyle={styles.ctaButtonText}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  metricCard: {
    backgroundColor: colors.slate[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricImage: {
    width: 30,
    height: 30,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  ctaButton: {
    backgroundColor: colors.slate[100],
    borderWidth: 1,
    borderColor: colors.slate[300],
  },
  ctaButtonText: {
    color: colors.text.primary,
  },
});
