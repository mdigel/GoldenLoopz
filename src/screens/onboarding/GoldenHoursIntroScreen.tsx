import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import Button from '../../components/ui/Button';

interface GoldenHoursIntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function GoldenHoursIntroScreen({ onNext, onBack }: GoldenHoursIntroScreenProps) {
  const renderBoldText = (text: string) => {
    const segments = text.split('**');
    return (
      <Text style={styles.cardText}>
        {segments.map((segment, segmentIndex) => (
          <Text
            key={`segment-${segmentIndex}`}
            style={segmentIndex % 2 === 1 ? styles.cardTextBold : undefined}
          >
            {segment}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Golden Hours</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {renderBoldText(
            'Your Golden Hours are split into 3 categories. Set a weekly goal for each.' +
              '\n\n**Building:** Creating your product, service, or content. This is the core work.' +
              '\n\n**Marketing:** Promoting, selling, and growing your audience. Getting your work seen.' +
              '\n\n**Learning:** Developing skills, reading, courses, and research. Investing in yourself.'
          )}
        </View>
      </View>

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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.cream[50],
    borderRadius: 0,
    padding: 24,
  },
  cardText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  cardTextBold: {
    fontWeight: '700',
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
