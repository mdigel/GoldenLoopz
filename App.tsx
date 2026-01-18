import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PostHogProvider } from 'posthog-react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useStreakStore } from './src/state/streakStore';
import './global.css';

// PostHog configuration
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

function AppContent() {
  const checkAndResetStreaks = useStreakStore((state) => state.checkAndResetStreaks);

  // Check streaks on app start
  useEffect(() => {
    checkAndResetStreaks();
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}

function PostHogWrapper({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_API_KEY) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        host: POSTHOG_HOST,
        enableSessionReplay: false,
      }}
      autocapture={false}
    >
      {children}
    </PostHogProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <PostHogWrapper>
            <AppContent />
          </PostHogWrapper>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
