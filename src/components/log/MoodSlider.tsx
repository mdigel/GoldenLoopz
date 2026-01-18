import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '../ui/Slider';
import { colors } from '../../constants/colors';

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function MoodSlider({ value, onChange }: MoodSliderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling today?</Text>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={100}
        step={1}
        leftLabel="Burned Out"
        rightLabel="Motivated"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    color: colors.text.primary,
  },
});
