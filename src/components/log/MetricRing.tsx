import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Image } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, METRICS, MetricKey } from '../../constants/colors';
import { InfoTooltip } from '../ui/InfoTooltip';

interface MetricRingProps {
  metricKey: MetricKey;
  value: number;
  goal: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const MetricRing: React.FC<MetricRingProps> = ({
  metricKey,
  value,
  onIncrement,
  onDecrement,
}) => {
  const metric = METRICS[metricKey];
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // Button press animations
  const decrementScale = useSharedValue(1);
  const incrementScale = useSharedValue(1);

  const size = 100;
  const strokeWidth = 10;
  const borderWidth = 1;
  const radius = (size - strokeWidth) / 2;
  const outerRadius = radius + strokeWidth / 2;
  const innerRadius = radius - strokeWidth / 2;
  const center = size / 2;

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Trigger spin celebration animation
    rotation.value = withSequence(
      withTiming(360, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 0 })
    );
    scale.value = withSequence(
      withTiming(1.05, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 150, easing: Easing.in(Easing.cubic) })
    );
    onIncrement();
  };

  const handleDecrement = () => {
    if (value > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrement();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const decrementButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: decrementScale.value }],
    opacity: decrementScale.value < 1 ? 0.7 : 1,
  }));

  const incrementButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: incrementScale.value }],
    opacity: incrementScale.value < 1 ? 0.7 : 1,
  }));

  // Format display value - always show hours and minutes for time metrics
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const shortDisplay = metric.type === 'time' ? formatTime(value) : `${value}`;
  const labelIcon =
    metricKey === 'building'
      ? require('../../../assets/pickaxe.png')
      : metricKey === 'marketing'
      ? require('../../../assets/megaphone.png')
      : metricKey === 'levelingUp'
      ? require('../../../assets/goldenyoutube.png')
      : null;
  const centerIcon = labelIcon;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.ringContainer}
        onPress={handleIncrement}
        onLongPress={handleDecrement}
        delayLongPress={300}
        activeOpacity={0.8}
      >
        <Animated.View style={animatedStyle}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id={`gradient-${metricKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={metric.ringProgress} />
                <Stop offset="100%" stopColor={metric.color} />
              </LinearGradient>
            </Defs>

            {/* Outer border */}
            <Circle
              cx={center}
              cy={center}
              r={outerRadius}
              stroke="rgba(0, 0, 0, 0.15)"
              strokeWidth={borderWidth}
              fill="none"
            />

            {/* Full ring - always complete */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={`url(#gradient-${metricKey})`}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Inner border */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              stroke="rgba(0, 0, 0, 0.15)"
              strokeWidth={borderWidth}
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Center content */}
        <View style={styles.centerContent}>
          {centerIcon && (
            <Image source={centerIcon} style={styles.centerIcon} resizeMode="contain" />
          )}
          <Text style={styles.valueText}>{shortDisplay}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.labelRow}>
        <Text style={styles.label}>{metric.label}</Text>
        <InfoTooltip text={metric.description} />
      </View>

      {/* Stepper controls */}
      <View style={styles.stepperContainer}>
        <Pressable
          onPressIn={() => {
            if (value > 0) decrementScale.value = withTiming(0.92, { duration: 80 });
          }}
          onPressOut={() => {
            decrementScale.value = withTiming(1, { duration: 80 });
          }}
          onPress={handleDecrement}
          disabled={value === 0}
        >
          <Animated.View style={[
            styles.stepperButton,
            value === 0 && styles.stepperButtonDisabled,
            decrementButtonStyle
          ]}>
            <Text style={[styles.stepperText, value === 0 && styles.stepperTextDisabled]}>−</Text>
          </Animated.View>
        </Pressable>

        <Pressable
          onPressIn={() => {
            incrementScale.value = withTiming(0.92, { duration: 80 });
          }}
          onPressOut={() => {
            incrementScale.value = withTiming(1, { duration: 80 });
          }}
          onPress={handleIncrement}
        >
          <Animated.View style={[styles.stepperButton, incrementButtonStyle]}>
            <Text style={styles.stepperText}>+</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 110,
  },
  ringContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  centerIcon: {
    width: 22,
    height: 22,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.slate[300],
  },
  stepperButtonDisabled: {
    backgroundColor: colors.slate[50],
  },
  stepperText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  stepperTextDisabled: {
    color: colors.text.muted,
  },
});
