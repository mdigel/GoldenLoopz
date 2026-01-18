import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { useLogStore } from '../state/logStore';
import { colors, METRICS } from '../constants/colors';
import { formatDisplayDate, formatMinutesToDisplay } from '../lib/dateUtils';
import Card from '../components/ui/Card';

type DayDetailRouteProp = RootStackScreenProps<'DayDetail'>['route'];

interface MetricRowProps {
  label: string;
  value: string;
  color: string;
}

function MetricRow({ label, value, color }: MetricRowProps) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b" style={{ borderBottomColor: colors.slate[100] }}>
      <View className="flex-row items-center">
        <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color }} />
        <Text className="text-base" style={{ color: colors.text.primary }}>{label}</Text>
      </View>
      <Text className="text-base font-semibold" style={{ color: colors.text.primary }}>{value}</Text>
    </View>
  );
}

export default function DayDetailScreen() {
  const route = useRoute<DayDetailRouteProp>();
  const { date } = route.params;
  const log = useLogStore((state) => state.getLogForDate(date));

  if (!log) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.text.secondary }}>No data for this day</Text>
      </SafeAreaView>
    );
  }

  // Get mood label
  const getMoodLabel = (score: number) => {
    if (score < 25) return 'Burned Out';
    if (score < 50) return 'Low Energy';
    if (score < 75) return 'Good';
    return 'Motivated';
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View className="mb-4">
          <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
            {formatDisplayDate(date)}
          </Text>
        </View>

        {/* Positive Inputs */}
        <Card variant="positive" className="mb-4">
          <Text className="text-base font-semibold mb-2" style={{ color: colors.gold[700] }}>
            Positive Inputs
          </Text>
          <MetricRow
            label={METRICS.building.label}
            value={formatMinutesToDisplay(log.buildingMinutes)}
            color={METRICS.building.color}
          />
          <MetricRow
            label={METRICS.marketing.label}
            value={formatMinutesToDisplay(log.marketingMinutes)}
            color={METRICS.marketing.color}
          />
          <MetricRow
            label={METRICS.levelingUp.label}
            value={formatMinutesToDisplay(log.levelingUpMinutes)}
            color={METRICS.levelingUp.color}
          />
          <MetricRow
            label={METRICS.workout.label}
            value={formatMinutesToDisplay(log.workoutMinutes)}
            color={METRICS.workout.color}
          />
        </Card>

        {/* Negative Inputs */}
        <Card variant="negative" className="mb-4">
          <Text className="text-base font-semibold mb-2" style={{ color: colors.slate[600] }}>
            Negative Inputs
          </Text>
          <MetricRow
            label={METRICS.drinks.label}
            value={log.drinks.toString()}
            color={METRICS.drinks.color}
          />
          <MetricRow
            label={METRICS.streaming.label}
            value={formatMinutesToDisplay(log.tvMinutes)}
            color={METRICS.streaming.color}
          />
        </Card>

        {/* Check-in */}
        <Card className="mb-4">
          <Text className="text-base font-semibold mb-3" style={{ color: colors.text.primary }}>
            Daily Check-in
          </Text>

          <View className="mb-4">
            <Text className="text-sm mb-1" style={{ color: colors.text.secondary }}>
              Mood
            </Text>
            <View className="flex-row items-center">
              <View
                className="h-2 rounded-full mr-3 flex-1"
                style={{ backgroundColor: colors.slate[200] }}
              >
                <View
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: colors.gold[500],
                    width: `${log.moodScore}%`,
                  }}
                />
              </View>
              <Text className="text-sm font-medium" style={{ color: colors.text.primary }}>
                {getMoodLabel(log.moodScore)}
              </Text>
            </View>
          </View>

          {log.reflection ? (
            <View>
              <Text className="text-sm mb-1" style={{ color: colors.text.secondary }}>
                Reflection
              </Text>
              <Text className="text-base" style={{ color: colors.text.primary }}>
                {log.reflection}
              </Text>
            </View>
          ) : (
            <Text className="text-sm italic" style={{ color: colors.text.secondary }}>
              No reflection recorded
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
