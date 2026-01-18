import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'positive' | 'negative' | 'neutral';
}

export default function SectionHeader({
  title,
  subtitle,
  variant = 'neutral',
}: SectionHeaderProps) {
  const getTitleColor = () => {
    switch (variant) {
      case 'positive':
        return colors.gold[700];
      case 'negative':
        return colors.slate[600];
      default:
        return colors.text.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: getTitleColor() }]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    color: colors.text.secondary,
  },
});
