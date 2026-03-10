import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

const youtubeVideoUrl =
  'https://www.youtube.com/watch?v=RH7REzcVjMI&list=TLGGAo6pkrodJE0xNDAxMjAyNg';

export default function MeetMidasScreen() {
  const handleOpenYoutubeVideo = async () => {
    const canOpen = await Linking.canOpenURL(youtubeVideoUrl);
    if (!canOpen) {
      Alert.alert('Unable to open link', 'Please try again later.');
      return;
    }
    await Linking.openURL(youtubeVideoUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image
            source={require('../../Logo_Ourofox.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Meet Midas, the Ourofox</Text>
          <Text style={styles.body}>
            As part fox, Midas is clever, resourceful, and entrepreneurial — just like the solopreneurs he guides.
          </Text>
          <Text style={styles.body}>
            As part ouroboros, he embodies the endless loop of habits and systems that compound into success.
          </Text>
          <Text style={styles.body}>
            Midas' name reminds you that everything you touch with a few consistent looping habits can turn to gold.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.videoTitle}>Watch the video that inspired this app.</Text>
          <TouchableOpacity
            style={styles.videoCard}
            onPress={handleOpenYoutubeVideo}
            activeOpacity={0.8}
            accessibilityRole="link"
            accessibilityLabel="Open YouTube video: How to Build a Business Part-Time"
          >
            <Image
              source={require('../../assets/YouTubeVideo.png')}
              style={styles.videoImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  videoImage: {
    width: '100%',
    height: 240,
  },
});
