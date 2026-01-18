import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack (contains Main tabs and modal screens)
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  DayDetail: { date: string };
  MetricSettings: { metricKey: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  LogTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};

// Progress Sub-tabs
export type ProgressTabType = 'week' | 'calendar' | 'stats';

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Declare for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
