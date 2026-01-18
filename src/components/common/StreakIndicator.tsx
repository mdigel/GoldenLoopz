import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface StreakIndicatorProps {
  count: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakIndicator({
  count,
  label = 'Day Streak',
  size = 'md',
}: StreakIndicatorProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return { icon: 16, text: 'text-sm', number: 'text-lg' };
      case 'md':
        return { icon: 20, text: 'text-sm', number: 'text-xl' };
      case 'lg':
        return { icon: 24, text: 'text-base', number: 'text-2xl' };
      default:
        return { icon: 20, text: 'text-sm', number: 'text-xl' };
    }
  };

  const sizes = getSize();
  const isActive = count > 0;

  return (
    <View className="flex-row items-center">
      <Flame
        size={sizes.icon}
        color={isActive ? colors.gold[500] : colors.slate[400]}
        fill={isActive ? colors.gold[500] : 'transparent'}
      />
      <View className="ml-2">
        <Text
          className={`font-bold ${sizes.number}`}
          style={{ color: isActive ? colors.gold[600] : colors.slate[500] }}
        >
          {count}
        </Text>
        <Text className={sizes.text} style={{ color: colors.text.secondary }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
