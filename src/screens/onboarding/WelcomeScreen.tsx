import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import Button from '../../components/ui/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CENTER_Y = SCREEN_HEIGHT * 0.42; // Approximate logo center
const CENTER_X = SCREEN_WIDTH / 2;

interface WelcomeScreenProps {
  onNext: () => void;
}

// Fewer, softer accents for a cleaner welcome layout
const LOGO_RADIUS = 120; // Safe buffer from 200x200 logo
const PICKAXE_POSITIONS = [
  { top: CENTER_Y - LOGO_RADIUS - 55, left: CENTER_X - 22, rotation: 0, scale: 0.62 },
  { top: CENTER_Y - 95, left: 18, rotation: -26, scale: 0.66 },
  { top: CENTER_Y - 85, left: SCREEN_WIDTH - 62, rotation: 26, scale: 0.66 },
  { top: CENTER_Y + 70, left: 36, rotation: -12, scale: 0.6 },
  { top: CENTER_Y + 60, left: SCREEN_WIDTH - 78, rotation: 14, scale: 0.6 },
];

function FloatingPickaxe({ position, index }: { position: typeof PICKAXE_POSITIONS[0]; index: number }) {
  const floatY = useSharedValue(0);
  const floatX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Highly randomized durations for organic feel
    const yDuration = 1800 + Math.random() * 2000;
    const xDuration = 2000 + Math.random() * 2200;
    const rotDuration = 2200 + Math.random() * 2500;

    // Random starting delay
    const startDelay = Math.random() * 500;

    // Random movement ranges
    const yRange = 10 + Math.random() * 10; // 10-20px
    const xRange = 8 + Math.random() * 10;  // 8-18px
    const rotRange = 5 + Math.random() * 8; // 5-13 degrees

    floatY.value = withDelay(
      startDelay,
      withRepeat(
        withSequence(
          withTiming(yRange, { duration: yDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(-yRange, { duration: yDuration * 1.1, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    floatX.value = withDelay(
      startDelay + 200,
      withRepeat(
        withSequence(
          withTiming(xRange, { duration: xDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(-xRange, { duration: xDuration * 0.9, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    rotate.value = withDelay(
      startDelay + 100,
      withRepeat(
        withSequence(
          withTiming(rotRange, { duration: rotDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(-rotRange, { duration: rotDuration * 1.05, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatY.value },
        { translateX: floatX.value },
        { rotate: `${position.rotation + rotate.value}deg` },
        { scale: position.scale },
      ],
    };
  });

  return (
    <Animated.Image
      source={require('../../../assets/pick.png')}
      style={[
        styles.pickaxe,
        { position: 'absolute', top: position.top, left: position.left },
        animatedStyle,
      ]}
    />
  );
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {PICKAXE_POSITIONS.map((pos, i) => (
        <FloatingPickaxe key={i} position={pos} index={i} />
      ))}

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../../Logo_Ourofox.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require('../../../assets/GoldenLoopz_spelled_out.png')}
            style={styles.titleImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.subtitleSection}>
          <Text style={styles.subtitle}>
            Discipline & accountability{'\n'}for 9-5ers' side hustle.
          </Text>
        </View>

        <View style={styles.ctaSection}>
          <Button
            title="Get Started"
            onPress={onNext}
            style={styles.ctaButton}
            textStyle={styles.ctaButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 172,
    height: 172,
    marginBottom: 18,
  },
  titleImage: {
    width: 280,
    height: 48,
  },
  subtitleSection: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  ctaSection: {
    marginTop: 28,
    width: '100%',
  },
  ctaButton: {
    backgroundColor: colors.slate[100],
    borderWidth: 1,
    borderColor: colors.slate[300],
  },
  ctaButtonText: {
    color: colors.text.primary,
  },
  pickaxe: {
    width: 40,
    height: 40,
    opacity: 0.6,
  },
});
