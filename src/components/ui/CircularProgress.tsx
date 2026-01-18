import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  backgroundColor: string;
  progressColor: string;
  gradientColors?: [string, string]; // Optional gradient
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  backgroundColor,
  progressColor,
  gradientColors,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {gradientColors && (
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={gradientColors ? 'url(#progressGradient)' : progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
    </View>
  );
};

// Concentric rings component for the main progress view
interface ConcentricRingsProps {
  buildingProgress: number; // 0 to 1
  marketingProgress: number;
  learningProgress: number;
  size?: number;
}

export const ConcentricRings: React.FC<ConcentricRingsProps> = ({
  buildingProgress,
  marketingProgress,
  learningProgress,
  size = 240,
}) => {
  // Always show a tiny bit of progress
  const MIN_PROGRESS = 0.03;
  const building = Math.max(MIN_PROGRESS, buildingProgress);
  const marketing = Math.max(MIN_PROGRESS, marketingProgress);
  const learning = Math.max(MIN_PROGRESS, learningProgress);

  // Ring configurations based on the design
  const outerStroke = 19;
  const middleStroke = 19;
  const innerStroke = 19;

  const outerRadius = (size - outerStroke) / 2;
  const middleRadius = outerRadius - outerStroke - 2;
  const innerRadius = middleRadius - middleStroke - 2;

  const outerCircumference = 2 * Math.PI * outerRadius;
  const middleCircumference = 2 * Math.PI * middleRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Purple gradient for Building - brighter */}
          <LinearGradient id="purpleGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#A855F7" />
            <Stop offset="100%" stopColor="#D946EF" />
          </LinearGradient>
          {/* Gold gradient for Marketing - brighter */}
          <LinearGradient id="goldGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FB923C" />
            <Stop offset="100%" stopColor="#F97316" />
          </LinearGradient>
        </Defs>

        {/* Outer ring - Building (Purple) */}
        {/* Background stroke */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={outerStroke + 2}
          fill="none"
        />
        {/* Background fill */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="#EFABFE"
          strokeWidth={outerStroke}
          fill="none"
        />
        {/* Progress stroke */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={outerStroke + 2}
          fill="none"
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerCircumference * (1 - building)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Progress fill */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="url(#purpleGradient)"
          strokeWidth={outerStroke}
          fill="none"
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerCircumference * (1 - building)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Middle ring - Learning (Yellow/Cream) */}
        {/* Background stroke */}
        <Circle
          cx={center}
          cy={center}
          r={middleRadius}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={middleStroke + 2}
          fill="none"
        />
        {/* Background fill */}
        <Circle
          cx={center}
          cy={center}
          r={middleRadius}
          stroke="#EFE1B7"
          strokeWidth={middleStroke}
          fill="none"
        />
        {/* Progress stroke */}
        <Circle
          cx={center}
          cy={center}
          r={middleRadius}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={middleStroke + 2}
          fill="none"
          strokeDasharray={middleCircumference}
          strokeDashoffset={middleCircumference * (1 - learning)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Progress fill */}
        <Circle
          cx={center}
          cy={center}
          r={middleRadius}
          stroke="#FDE047"
          strokeWidth={middleStroke}
          fill="none"
          strokeDasharray={middleCircumference}
          strokeDashoffset={middleCircumference * (1 - learning)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Inner ring - Marketing (Gold/Orange) */}
        {/* Background stroke */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={innerStroke + 2}
          fill="none"
        />
        {/* Background fill */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="#E9C08F"
          strokeWidth={innerStroke}
          fill="none"
        />
        {/* Progress stroke */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={innerStroke + 2}
          fill="none"
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerCircumference * (1 - marketing)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Progress fill */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="url(#goldGradient)"
          strokeWidth={innerStroke}
          fill="none"
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerCircumference * (1 - marketing)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
