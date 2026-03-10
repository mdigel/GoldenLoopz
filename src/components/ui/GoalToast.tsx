import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONFETTI_COUNT = 24;
const CONFETTI_COLORS = [
  colors.gold[400],
  colors.gold[500],
  colors.purple[400],
  colors.purple[500],
  colors.success,
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
];

export type GoalToastType = 'goal_hit' | 'anti_goal_broken' | null;

interface GoalToastProps {
  visible: boolean;
  type: GoalToastType;
  metricName: string;
  onDismiss: () => void;
}

interface ConfettiPiece {
  x: number;
  delay: number;
  color: string;
  rotation: number;
  size: number;
}

function generateConfettiPieces(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 300,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));
}

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 80;
    translateY.value = withDelay(
      piece.delay,
      withTiming(Dimensions.get('window').height * 0.4, {
        duration: 1800 + Math.random() * 600,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      piece.delay,
      withTiming(drift, {
        duration: 1800 + Math.random() * 600,
        easing: Easing.inOut(Easing.sin),
      })
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, { duration: 2000 })
    );
    opacity.value = withDelay(
      1200 + piece.delay,
      withTiming(0, { duration: 600 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: piece.x,
          top: 0,
          width: piece.size,
          height: piece.size * 1.5,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

export function GoalToast({ visible, type, metricName, onDismiss }: GoalToastProps) {
  const translateY = useSharedValue(-120);
  const toastOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const confettiPiecesRef = useRef<ConfettiPiece[]>(generateConfettiPieces());
  const showConfetti = useSharedValue(false);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-120, { duration: 300, easing: Easing.in(Easing.cubic) });
    toastOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(onDismiss, 350);
  }, [onDismiss]);

  useEffect(() => {
    if (!visible || !type) return;

    confettiPiecesRef.current = generateConfettiPieces();

    // Slide in
    translateY.value = withSpring(60, { damping: 15, stiffness: 150 });
    toastOpacity.value = withTiming(1, { duration: 200 });

    if (type === 'goal_hit') {
      showConfetti.value = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Shake for anti-goal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeX.value = withSequence(
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    // Auto-dismiss after 2.5s
    const timer = setTimeout(dismiss, 2500);
    return () => clearTimeout(timer);
  }, [visible, type]);

  const toastStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: shakeX.value },
    ],
    opacity: toastOpacity.value,
  }));

  if (!visible || !type) return null;

  const isGoalHit = type === 'goal_hit';

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Confetti layer */}
      {isGoalHit && confettiPiecesRef.current.map((piece, i) => (
        <ConfettiParticle key={i} piece={piece} />
      ))}

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          isGoalHit ? styles.toastGoal : styles.toastAntiGoal,
          toastStyle,
        ]}
      >
        <Text style={styles.toastEmoji}>{isGoalHit ? '🎉' : '⚠️'}</Text>
        <View style={styles.toastContent}>
          <Text style={[styles.toastTitle, isGoalHit ? styles.toastTitleGoal : styles.toastTitleAntiGoal]}>
            {isGoalHit ? 'Weekly Goal Hit!' : 'Weekly Limit Exceeded'}
          </Text>
          <Text style={styles.toastMessage}>
            {isGoalHit
              ? `You hit your ${metricName} goal this week!`
              : `You passed your ${metricName} cap this week.`}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  toast: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastGoal: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: colors.success,
  },
  toastAntiGoal: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.error,
  },
  toastEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastTitleGoal: {
    color: '#166534',
  },
  toastTitleAntiGoal: {
    color: '#991B1B',
  },
  toastMessage: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});
