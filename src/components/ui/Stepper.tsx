import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  increment?: number;
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  buttonSize?: number;
  iconSize?: number;
  valueFontSize?: number;
  valueMinWidth?: number;
  valueMarginHorizontal?: number;
}

export default function Stepper({
  value,
  onChange,
  increment = 1,
  min = 0,
  max = 999,
  formatValue,
  buttonSize = 36,
  iconSize = 18,
  valueFontSize = 16,
  valueMinWidth = 60,
  valueMarginHorizontal = 8,
}: StepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(Math.max(min, value - increment));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(Math.min(max, value + increment));
    }
  };

  const displayValue = formatValue ? formatValue(value) : String(value);
  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleDecrement}
        disabled={isMinDisabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          isMinDisabled && styles.buttonDisabled,
        ]}
      >
        <Minus
          size={iconSize}
          color={isMinDisabled ? colors.text.muted : colors.text.primary}
          strokeWidth={3}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.valueContainer,
          { minWidth: valueMinWidth, marginHorizontal: valueMarginHorizontal },
        ]}
      >
        <Text style={[styles.valueText, { fontSize: valueFontSize }]}>{displayValue}</Text>
      </View>

      <TouchableOpacity
        onPress={handleIncrement}
        disabled={isMaxDisabled}
        activeOpacity={0.7}
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          isMaxDisabled && styles.buttonDisabled,
        ]}
      >
        <Plus
          size={iconSize}
          color={isMaxDisabled ? colors.text.muted : colors.text.primary}
          strokeWidth={3}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.slate[100],
    borderWidth: 1,
    borderColor: colors.slate[300],
  },
  buttonDisabled: {
    backgroundColor: colors.slate[50],
  },
  valueContainer: {
    minWidth: 60,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
