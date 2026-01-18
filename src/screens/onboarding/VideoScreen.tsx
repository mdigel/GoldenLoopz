import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import Button from '../../components/ui/Button';

interface VideoScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function VideoScreen({ onNext, onBack }: VideoScreenProps) {
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
        <Text style={styles.introText}>
          This app was inspired by Ali Abdaal's video on finding time to build a business while working a 9-to-5.
        </Text>

        {/* YouTube Video Card */}
        <TouchableOpacity style={styles.videoCard} onPress={onNext} activeOpacity={0.8}>
          <View style={styles.videoThumbnail}>
            <Image
              source={require('../../../assets/Ali.png')}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Play size={32} color={colors.background} fill={colors.background} />
              </View>
            </View>
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>How to Find Time to Build a Business</Text>
            <Text style={styles.videoChannel}>Ali Abdaal</Text>
            <Text style={styles.tapToWatch}>Tap to see key takeaways</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            The video is 36 minutes long. We've summarized the key points for you on the next screen.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={onNext} />
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
    paddingHorizontal: 24,
  },
  introText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  videoCard: {
    backgroundColor: colors.slate[100],
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  videoThumbnail: {
    height: 200,
    backgroundColor: colors.slate[800],
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.purple[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  videoChannel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  tapToWatch: {
    fontSize: 13,
    color: colors.purple[500],
    fontWeight: '500',
  },
  noteCard: {
    backgroundColor: colors.purple[50],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.purple[500],
  },
  noteText: {
    fontSize: 14,
    color: colors.purple[700],
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
