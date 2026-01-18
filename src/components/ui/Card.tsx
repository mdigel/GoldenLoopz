import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'positive' | 'negative';
}

export default function Card({ children, variant = 'default', style, ...props }: CardProps) {
  const getBorderColor = () => {
    switch (variant) {
      case 'positive':
        return colors.gold[200];
      case 'negative':
        return colors.slate[200];
      default:
        return colors.border;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { borderColor: getBorderColor() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
