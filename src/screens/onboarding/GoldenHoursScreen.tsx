import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useGoalsStore } from '../../state/goalsStore';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';

interface GoldenHoursScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const formatHours = (value: number) => `${value} hrs`;

export default function GoldenHoursScreen({ onNext, onBack }: GoldenHoursScreenProps) {
  const { goals, updateGoals } = useGoalsStore();
  const totalHours = goals.buildingHours + goals.marketingHours + goals.levelingUpHours;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Your Weeky Goals</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Building */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.purple[50] }]}>
              <Image
                source={require('../../../assets/pickaxe.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Building</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Weekly goal</Text>
            <Stepper
              value={goals.buildingHours}
              onChange={(value) => updateGoals({ buildingHours: value })}
              increment={1}
              min={0}
              max={40}
              formatValue={formatHours}
            />
          </View>
        </View>

        {/* Marketing */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.gold[50] }]}>
              <Image
                source={require('../../../assets/megaphone.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Marketing</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Weekly goal</Text>
            <Stepper
              value={goals.marketingHours}
              onChange={(value) => updateGoals({ marketingHours: value })}
              increment={1}
              min={0}
              max={40}
              formatValue={formatHours}
            />
          </View>
        </View>

        {/* Learning */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.cream[50] }]}>
              <Image
                source={require('../../../assets/goldenyoutube.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Learning</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Weekly goal</Text>
            <Stepper
              value={goals.levelingUpHours}
              onChange={(value) => updateGoals({ levelingUpHours: value })}
              increment={1}
              min={0}
              max={40}
              formatValue={formatHours}
            />
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total weekly goal</Text>
          <Text style={styles.totalValue}>{formatHours(totalHours)}</Text>
        </View>
        <Text style={styles.totalHelpText}>
          You can adjust these weekly goals anytime as the needs of your business change.
        </Text>

      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={onNext}
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
  categoryCard: {
    backgroundColor: colors.slate[50],
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryImage: {
    width: 28,
    height: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.slate[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  totalHelpText: {
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
    marginTop: 2,
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
