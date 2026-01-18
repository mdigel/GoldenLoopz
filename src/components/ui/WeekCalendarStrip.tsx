import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { addDays, format, isToday, isSameDay } from 'date-fns';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = 60;
const DAYS_BEFORE = 60; // 60 days in the past
const DAYS_AFTER = 60;  // 60 days in the future
const TOTAL_DAYS = DAYS_BEFORE + 1 + DAYS_AFTER; // 121 days total
const SIDE_PADDING = (SCREEN_WIDTH - DAY_WIDTH) / 2;
const ITEM_HEIGHT = 76;

interface WeekCalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledToToday = useRef(false);
  const [centeredIndex, setCenteredIndex] = useState(DAYS_BEFORE);

  // Get today's date (normalized to midnight)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Generate 121 days: 60 before today + today + 60 after today
  const days = useMemo(() =>
    Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(today, i - DAYS_BEFORE)),
    [today]
  );

  // Scroll to today when content size is ready
  const handleContentSizeChange = useCallback((contentWidth: number) => {
    if (!hasScrolledToToday.current && contentWidth > 0) {
      const todayOffset = DAYS_BEFORE * DAY_WIDTH;
      scrollViewRef.current?.scrollTo({ x: todayOffset, animated: false });
      hasScrolledToToday.current = true;
    }
  }, []);

  // Track scroll position
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / DAY_WIDTH);
    const clampedIndex = Math.max(0, Math.min(index, TOTAL_DAYS - 1));
    if (clampedIndex !== centeredIndex) {
      setCenteredIndex(clampedIndex);
    }
  }, [centeredIndex]);

  // Handle scroll end
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / DAY_WIDTH);
    const clampedIndex = Math.max(0, Math.min(index, TOTAL_DAYS - 1));
    const newDate = days[clampedIndex];

    setCenteredIndex(clampedIndex);

    if (!isSameDay(newDate, selectedDate)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDateSelect(newDate);
    }

    // Snap to exact position
    scrollViewRef.current?.scrollTo({ x: clampedIndex * DAY_WIDTH, animated: true });
  }, [days, onDateSelect, selectedDate]);

  return (
    <View style={styles.container}>
      {/* Purple selection indicator */}
      <View style={styles.selectionIndicator} pointerEvents="none" />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentOffset={{ x: DAYS_BEFORE * DAY_WIDTH, y: 0 }}
        snapToInterval={DAY_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        onContentSizeChange={handleContentSizeChange}
      >
        {days.map((day, index) => {
          const isDayToday = isToday(day);
          const isCentered = index === centeredIndex;

          return (
            <View key={day.toISOString()} style={styles.dayContainer}>
              <Text style={[
                styles.monthLabel,
                isCentered && styles.centeredText,
                isDayToday && !isCentered && styles.todayText,
              ]}>
                {isDayToday ? 'Today' : format(day, 'MMM')}
              </Text>
              <Text style={[
                styles.dayNumber,
                isDayToday && !isCentered && styles.todayText,
                isCentered && styles.centeredText,
              ]}>
                {format(day, 'd')}
              </Text>
              <Text style={[
                styles.dayName,
                isCentered && styles.centeredText,
              ]}>
                {format(day, 'EEE')}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Left fade - multiple layers for gradient effect */}
      <View style={styles.leftFade} pointerEvents="none">
        <View style={[styles.fadeLayer, { left: 0, opacity: 1 }]} />
        <View style={[styles.fadeLayer, { left: 12, opacity: 0.85 }]} />
        <View style={[styles.fadeLayer, { left: 24, opacity: 0.7 }]} />
        <View style={[styles.fadeLayer, { left: 36, opacity: 0.5 }]} />
        <View style={[styles.fadeLayer, { left: 48, opacity: 0.35 }]} />
        <View style={[styles.fadeLayer, { left: 60, opacity: 0.2 }]} />
        <View style={[styles.fadeLayer, { left: 72, opacity: 0.08 }]} />
      </View>

      {/* Right fade - multiple layers for gradient effect */}
      <View style={styles.rightFade} pointerEvents="none">
        <View style={[styles.fadeLayer, { right: 0, opacity: 1 }]} />
        <View style={[styles.fadeLayer, { right: 12, opacity: 0.85 }]} />
        <View style={[styles.fadeLayer, { right: 24, opacity: 0.7 }]} />
        <View style={[styles.fadeLayer, { right: 36, opacity: 0.5 }]} />
        <View style={[styles.fadeLayer, { right: 48, opacity: 0.35 }]} />
        <View style={[styles.fadeLayer, { right: 60, opacity: 0.2 }]} />
        <View style={[styles.fadeLayer, { right: 72, opacity: 0.08 }]} />
      </View>
    </View>
  );
};

const FADE_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    position: 'relative',
    height: ITEM_HEIGHT + 24,
    overflow: 'hidden',
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FADE_WIDTH,
    height: ITEM_HEIGHT + 24,
    zIndex: 10,
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: FADE_WIDTH,
    height: ITEM_HEIGHT + 24,
    zIndex: 10,
  },
  fadeLayer: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: ITEM_HEIGHT + 24,
    backgroundColor: colors.background,
  },
  selectionIndicator: {
    position: 'absolute',
    left: SIDE_PADDING,
    top: 12,
    width: DAY_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: colors.purple[500],
    borderRadius: 16,
    zIndex: 0,
  },
  scrollContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 12,
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DAY_WIDTH,
    height: ITEM_HEIGHT,
    zIndex: 1,
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  centeredText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: colors.purple[500],
  },
});
