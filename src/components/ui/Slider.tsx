import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { colors } from '../../constants/colors';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  step?: number;
}

export default function Slider({
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = 0,
  maximumValue = 100,
  leftLabel,
  rightLabel,
  step = 1,
}: SliderProps) {
  return (
    <View style={styles.container}>
      {(leftLabel || rightLabel) && (
        <View style={styles.labelContainer}>
          <Text style={styles.leftLabel}>{leftLabel}</Text>
          <Text style={styles.rightLabel}>{rightLabel}</Text>
        </View>
      )}
      <RNSlider
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={colors.gold[500]}
        maximumTrackTintColor={colors.slate[200]}
        thumbTintColor={colors.gold[500]}
        style={styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate[500],
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gold[600],
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
