import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import Button from '../../components/ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_SPACING = 0;
const SIDE_PADDING = 0;

const SPARKNOTES = [
  {
    text: 'Meet Ali Addal. He was a med student, then a doctor.',
    image: require('../../../assets/Ali_NoBackground.png'),
  },
  {
    text: 'On the side, he built a Youtube channel.\nNow he\'s got 6.5M subscribers and is very much a **millionaire.**',
  },
  {
    text: 'He made **this video** sharing how he did it and how you can too. \n(The full video can be found in your profile)',
    image: require('../../../assets/YouTubeVideo.png'),
  },
  {
    text: 'Everyone has **168 hours in a week**; the difference lies in how that time is used.',
  },
  {
    parts: [
      { text: 'A standard week for a W2\'er might look like this:\n\n' },
      { text: 'Sleep: 56 hrs ', bold: false },
      { text: '(8 hours / day)', bold: true },
      { text: '\nWork: 40 hrs ', bold: false },
      { text: '(9-5)', bold: true },
      { text: '\nCommute: 10 hrs ', bold: false },
      { text: '(2 hours / day)', bold: true },
      { text: '\nLife stuff: 21 hrs ', bold: false },
      { text: '(3 hours / day)', bold: true },
      { text: '\n\nThat leaves ', bold: false },
      { text: '41 hours.', bold: true },
    ],
  },
  {
    text: 'Successful part-time businesses often require **10-15 hours per week.**',
  },
  {
    text: 'Identify your **"Golden Hours"**... find 10 hours where you can work on your business each week.',
  },
  {
    text: 'For Ali, it was **6-9 PM** after work when he felt energized to work on his YouTube channel.',
  },
  {
    text: 'A friend of his uses **6-10 PM on Monday and Tuesday evenings** as his non-negotiable business time.',
  },
  {
    text: 'It\'s okay to start with just **5 hours**. Success and enjoyment can fuel motivation to increase time later.',
  },
  {
    text: 'The goal is not to optimize every minute and risk burnout, but to be more **intentional with time usage.**',
  },
];

interface SparknotesScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SparknotesScreen({ onNext, onBack }: SparknotesScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderBoldText = useCallback((text: string) => {
    const segments = text.split('**');
    return (
      <Text style={styles.sparknoteText}>
        {segments.map((segment, segmentIndex) => (
          <Text
            key={`seg-${segmentIndex}`}
            style={segmentIndex % 2 === 1 ? styles.sparknoteTextBold : undefined}
          >
            {segment}
          </Text>
        ))}
      </Text>
    );
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    if (index >= 0 && index < SPARKNOTES.length) {
      setCurrentIndex(index);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Inspiration</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselContent}
          >
            {SPARKNOTES.map((note, index) => (
              <View
                key={index}
                style={[styles.sparknoteCard, !note.image && styles.sparknoteCardNoImage]}
              >
                {note.image && (
                  <Image source={note.image} style={styles.sparkImage} resizeMode="contain" />
                )}
                {note.parts ? (
                  <Text style={styles.sparknoteText}>
                    {note.parts.map((part, partIndex) => (
                      <Text
                        key={`${index}-${partIndex}`}
                        style={part.bold ? styles.sparknoteTextBold : undefined}
                      >
                        {part.text}
                      </Text>
                    ))}
                  </Text>
                ) : note.text ? (
                  renderBoldText(note.text)
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.carouselNav}>
            <View style={styles.dots}>
              {SPARKNOTES.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, currentIndex === index && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {currentIndex === SPARKNOTES.length - 1 && (
          <Button
            title="Continue"
            onPress={onNext}
            style={styles.ctaButton}
            textStyle={styles.ctaButtonText}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselContainer: {
    marginBottom: 8,
  },
  carouselContent: {
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
  },
  sparknoteCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.cream[50],
    borderRadius: 0,
    padding: 24,
    minHeight: 220,
  },
  sparknoteCardNoImage: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sparknoteText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  sparknoteTextBold: {
    fontWeight: '700',
  },
  sparkImage: {
    width: '100%',
    height: 160,
    marginBottom: 16,
  },
  carouselNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.slate[300],
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.purple[500],
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    minHeight: 72,
    justifyContent: 'flex-end',
  },
  ctaButton: {
    backgroundColor: colors.slate[100],
    borderWidth: 1,
    borderColor: colors.slate[300],
  },
  ctaButtonText: {
    color: colors.text.primary,
  },
});
