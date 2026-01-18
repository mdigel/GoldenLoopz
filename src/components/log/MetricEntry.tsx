import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import Stepper from '../ui/Stepper';
import { colors } from '../../constants/colors';
import { formatMinutesToDisplay } from '../../lib/dateUtils';

interface MetricEntryProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  type: 'time' | 'count';
  increment: number;
  category: 'positive' | 'negative';
  color: string;
  maxValue?: number;
}

export default function MetricEntry({
  label,
  description,
  value,
  onChange,
  type,
  increment,
  category,
  color,
  maxValue = 480,
}: MetricEntryProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatValue = (val: number) => {
    if (type === 'time') {
      return formatMinutesToDisplay(val);
    }
    return val.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.label}>{label}</Text>
          <TouchableOpacity
            onPress={() => setShowTooltip(!showTooltip)}
            style={styles.infoButton}
          >
            <Info size={16} color={colors.slate[400]} />
          </TouchableOpacity>
        </View>
        <Stepper
          value={value}
          onChange={onChange}
          increment={increment}
          min={0}
          max={type === 'count' ? 50 : maxValue}
          formatValue={formatValue}
        />
      </View>

      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  infoButton: {
    padding: 4,
    marginLeft: 4,
  },
  tooltip: {
    marginTop: 8,
    marginLeft: 20,
    padding: 12,
    backgroundColor: colors.gold[50],
    borderRadius: 8,
  },
  tooltipText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
