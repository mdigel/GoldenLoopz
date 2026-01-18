import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';

interface MoodScaleProps {
  value: number; // 1-10
  onChange: (value: number) => void;
  label?: string;
}

export const MoodScale: React.FC<MoodScaleProps> = ({
  value,
  onChange,
  label = 'Mood',
}) => {
  const handleSelect = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(num);
  };

  const moodColors = colors.mood;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.scaleContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isSelected = num === value;
          const moodColor = moodColors[num as keyof typeof moodColors];

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.moodButton,
                { backgroundColor: moodColor },
                isSelected && styles.selectedButton,
              ]}
              onPress={() => handleSelect(num)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.moodNumber,
                  isSelected && styles.selectedNumber,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.endLabel}>Burned Out</Text>
        <Text style={styles.endLabel}>Motivated</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  moodButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  selectedButton: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  moodNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedNumber: {
    fontWeight: '700',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  endLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
});
