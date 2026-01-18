# React Native App Starter Template

> Lessons learned from building SwipeCardz - a production iOS app.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Package.json Scripts](#packagejson-scripts)
4. [Dependencies](#dependencies)
5. [Required Config Files](#required-config-files) ⚠️ **Don't skip this!**
6. [Environment Variables](#environment-variables)
7. [EAS Build Configuration](#eas-build-configuration)
8. [App.json Configuration](#appjson-configuration)
9. [Analytics Setup (PostHog)](#analytics-setup-posthog)
10. [Monetization (RevenueCat)](#monetization-revenuecat)
11. [Local Storage Pattern](#local-storage-pattern)
12. [State Management (Zustand)](#state-management-zustand)
13. [Navigation Setup](#navigation-setup)
14. [Onboarding Flow](#onboarding-flow)
15. [App Store Gotchas](#app-store-gotchas)
16. [Common Build Issues](#common-build-issues)

---

## Tech Stack

| Category | Technology | Why |
|----------|------------|-----|
| Framework | Expo SDK 53 | Managed workflow, easy OTA updates, EAS builds |
| UI | React Native 0.79 | Cross-platform native |
| Styling | NativeWind 4 + Tailwind | Utility-first, fast iteration |
| Navigation | React Navigation 7 | Industry standard, type-safe |
| State | Zustand | Simple, no boilerplate, persisted state |
| Storage | AsyncStorage | Local-first, no backend dependency |
| Analytics | PostHog | Product analytics, funnels, feature flags |
| Monetization | RevenueCat | IAP abstraction, works with App Store |
| Icons | Lucide React Native | Consistent, tree-shakeable icons |
| Animations | Reanimated 3 | 60fps native animations |
| Haptics | Expo Haptics | Native feedback |

---

## Project Structure

```
src/
├── components/      # Reusable UI components
├── lib/             # Utilities & modules (localStorage, analytics, purchases)
├── navigation/      # Navigation config & types
├── screens/         # Screen components
├── state/           # Zustand stores
├── types/           # TypeScript types
└── utils/           # Helper functions
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "dev": "npx expo run:ios",
    "ipad": "npx expo run:ios --device \"iPad Air 13-inch (M2)\"",
    "web": "expo start --web",
    "lint": "expo lint",
    "format": "npx prettier --write .",
    "typecheck": "tsc --noEmit",
    "prebuild-check": "tsc --noEmit && npx expo export --platform ios --output-dir .expo-check --clear && rm -rf .expo-check && echo '✅ Pre-build check passed'",
    "full-rebuild": "rm -rf node_modules && npm install --legacy-peer-deps && npx expo run:ios",
    "version:bump": "node -e \"const fs=require('fs'); const app=JSON.parse(fs.readFileSync('app.json')); const v=app.expo.version.split('.'); v[2]=parseInt(v[2])+1; app.expo.version=v.join('.'); fs.writeFileSync('app.json',JSON.stringify(app,null,2)+'\\n'); console.log('Bumped to '+app.expo.version);\"",
    "build:ios": "npm run version:bump && npx eas-cli build --platform ios",
    "build:ios:submit": "npm run version:bump && npx eas-cli build --platform ios --auto-submit"
  }
}
```

### Script Explanations

| Script | Purpose |
|--------|---------|
| `dev` | Local iOS development |
| `ipad` | Run on specific iPad simulator |
| `prebuild-check` | Verify build will succeed before submitting |
| `full-rebuild` | Nuclear option for dependency issues |
| `version:bump` | Auto-increment patch version |
| `build:ios` | Build for TestFlight |
| `build:ios:submit` | Build AND auto-submit to App Store |

---

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/native-stack": "^7.3.2",
    "expo": "~53.0.25",
    "expo-haptics": "~14.1.4",
    "lucide-react-native": "0.544.0",
    "nativewind": "^4.1.23",
    "posthog-react-native": "^4.10.8",
    "react": "19.0.0",
    "react-native": "0.79.6",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-purchases": "^9.6.12",
    "react-native-purchases-ui": "^9.6.12",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-toast-message": "^2.3.3",
    "react-native-worklets": "^1.0.0",
    "tailwindcss": "^3.4.17",
    "zustand": "^5.0.4"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "babel-preset-expo": "~13.2.0",
    "typescript": "~5.9.2"
  }
}
```

### Important Override (NativeWind fix)

```json
{
  "overrides": {
    "react-native-css-interop": "0.1.22"
  }
}
```

### Critical Note: Reanimated 4.x

If using **react-native-reanimated 4.x+**, you MUST also install `react-native-worklets`:

```bash
npm install react-native-worklets --legacy-peer-deps
```

Without this, you'll get: `[Reanimated] Failed to validate worklets version`

---

## Required Config Files

These config files are **REQUIRED** and often forgotten. Missing them causes white screens or build failures.

### 1. babel.config.js (CRITICAL for NativeWind v4)

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**Without this:** App shows blank white screen with no errors.

### 2. metro.config.js

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 3. tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Your custom colors here
    },
  },
  plugins: [],
};
```

### 4. global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. nativewind-env.d.ts (TypeScript support)

```ts
/// <reference types="nativewind/types" />
```

### 6. index.ts (Entry point)

```ts
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

Then in `package.json`, set:
```json
{
  "main": "index.ts"
}
```

---

## Environment Variables

Create `.env` file:

```bash
# Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# RevenueCat (separate keys for dev/prod)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxx      # Development/sandbox
EXPO_PUBLIC_REVENUECAT_APP_KEY=appl_xxxxxxxxxx      # Production
```

---

## EAS Build Configuration

`eas.json`:

```json
{
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "base": {
      "node": "20.18.0",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true",
        "EXPO_PUBLIC_POSTHOG_HOST": "https://us.i.posthog.com",
        "SENTRY_DISABLE_AUTO_UPLOAD": "true"
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "extends": "base",
      "distribution": "internal"
    },
    "production": {
      "extends": "base",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Key Settings

- `NPM_CONFIG_LEGACY_PEER_DEPS`: Required for some packages with peer dep conflicts
- `appVersionSource: "remote"`: Let EAS manage build numbers
- `autoIncrement`: Auto-bump build number for each submission

---

## App.json Configuration

```json
{
  "expo": {
    "name": "YourAppName",
    "slug": "your-app-slug",
    "scheme": "yourapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "edgeToEdgeEnabled": true,
      "package": "com.yourcompany.yourapp"
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### Critical iOS Settings

- `ITSAppUsesNonExemptEncryption: false` - Avoids export compliance questions
- `bundleIdentifier` - Must match your App Store Connect app

---

## Analytics Setup (PostHog)

### Provider Setup (App.tsx)

```tsx
import { PostHogProvider } from "posthog-react-native";

<PostHogProvider
  apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY || ""}
  options={{
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  }}
>
  {/* App content */}
</PostHogProvider>
```

### Analytics Module (src/lib/analytics.ts)

```typescript
import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';

export const useScreenTracking = (screenName: string, properties?: Record<string, any>) => {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.screen(screenName, properties);
  }, [screenName]);
};
```

### Events to Track from Day 1

#### Onboarding Funnel
| Event | When |
|-------|------|
| `Application Opened` | App launch (auto-captured) |
| `Onboarding Started` | User taps "Get Started" |
| `Tutorial Started` | User begins tutorial |
| `Tutorial Complete` | User finishes tutorial |
| `Onboarding Complete` | User enters main app |

#### Activation Funnel
| Event | When |
|-------|------|
| `Create Deck Tapped` | User taps + button |
| `Deck Created` | User successfully creates content |
| `PracticeSession Started` | User starts using core feature |
| `PracticeSession Complete` | User completes session |

#### Monetization Funnel
| Event | Properties | When |
|-------|------------|------|
| `Paywall Presented` | `source` | User sees paywall |
| `Purchase Started` | `source`, `price` | User taps buy |
| `Purchase Completed` | `source`, `price` | Successful purchase |
| `Purchase Failed` | `source`, `error` | Purchase error |
| `Purchase Cancelled` | `source` | User dismisses |
| `Restore Started` | `source` | User taps restore |
| `Restore Completed` | `source`, `had_entitlement` | Restore finishes |
| `Restore Failed` | `source`, `error` | Restore error |
| `Paywall Dismissed` | `source` | User closes paywall |

---

## Monetization (RevenueCat)

### Purchases Module (src/lib/purchases.ts)

```typescript
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";

const ENTITLEMENT_ID = "your_entitlement_id";
const IOS_API_KEY = __DEV__
  ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || ""
  : process.env.EXPO_PUBLIC_REVENUECAT_APP_KEY || "";

let isInitialized = false;

export async function initializePurchases(): Promise<void> {
  if (isInitialized || !IOS_API_KEY) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  if (Platform.OS === "ios") {
    await Purchases.configure({ apiKey: IOS_API_KEY });
    isInitialized = true;
  }
}

export async function checkAccess(): Promise<boolean> {
  if (!isInitialized) return false;

  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function purchasePackage(): Promise<{ success: boolean; error?: string }> {
  // Implementation...
}

export async function restorePurchases(): Promise<{ success: boolean; hasEntitlement: boolean }> {
  // Implementation...
}
```

### Purchase Store (src/state/purchaseStore.ts)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PurchaseState {
  isUnlimited: boolean;
  setUnlimited: (value: boolean) => void;
  checkEntitlement: () => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      isUnlimited: false,
      setUnlimited: (value) => set({ isUnlimited: value }),
      checkEntitlement: async () => {
        const hasAccess = await checkAccess();
        set({ isUnlimited: hasAccess });
      },
    }),
    {
      name: 'purchase-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## Local Storage Pattern

### Storage Module (src/lib/localStorage.ts)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEMS_KEY = 'app_items';

export interface Item {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function getItems(): Promise<Item[]> {
  const data = await AsyncStorage.getItem(ITEMS_KEY);
  if (!data) return [];

  return JSON.parse(data).map((item: Item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));
}

export async function createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
  const items = await getItems();

  const newItem: Item = {
    ...item,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify([...items, newItem]));
  return newItem;
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  const items = await getItems();
  const index = items.findIndex(i => i.id === id);

  if (index === -1) throw new Error('Item not found');

  const updated = { ...items[index], ...updates, updatedAt: new Date() };
  items[index] = updated;

  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return updated;
}

export async function deleteItem(id: string): Promise<void> {
  const items = await getItems();
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items.filter(i => i.id !== id)));
}
```

---

## State Management (Zustand)

### Basic Store Pattern

```typescript
import { create } from 'zustand';

interface AppState {
  items: Item[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    const items = await localStorage.getItems();
    set({ items, isLoading: false });
  },

  addItem: (item) => {
    set({ items: [...get().items, item] });
  },
}));
```

### Persisted Store (for settings, user preferences)

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## Navigation Setup

### Types (src/navigation/types.ts)

```typescript
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Welcome: undefined;
  Tutorial: { deckId: string };
  Paywall: { source?: string };
  // Add other screens...
};

export type MainTabParamList = {
  HomeTab: undefined;
  SettingsTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BottomTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    import('@react-navigation/bottom-tabs').BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;
```

---

## Onboarding Flow

### Recommended Screen Flow

```
Welcome → DemoSelection → Tutorial → Main App
```

### Onboarding Store

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Root Navigator Pattern

```tsx
export default function RootNavigator() {
  const hasCompletedOnboarding = useOnboardingStore(s => s.hasCompletedOnboarding);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Tutorial" component={TutorialScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
        </>
      )}
      {/* Modal screens available always */}
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}
```

---

## App Store Gotchas

### Things That Will Get You Rejected

1. **Placeholder content** - No "Coming Soon", "Lorem ipsum", or beta features
2. **Non-functional buttons** - Every button must do something
3. **Missing privacy policy** - Required for all apps
4. **Test/Debug content visible** - Hide dev-only features in production
5. **Broken in-app purchases** - Test thoroughly in sandbox

### Required Info.plist Settings

```json
{
  "ITSAppUsesNonExemptEncryption": false
}
```

### Demo/Test Content

Only show demo content in development:

```typescript
if (__DEV__) {
  await seedDevelopmentData();
}
```

### Paywall Requirements

- Must have "Restore Purchases" button
- Must show price clearly
- Must link to Terms of Service and Privacy Policy

---

## Common Build Issues

### 1. Blank White Screen (No Errors)

**Cause:** Missing `babel.config.js` for NativeWind v4

**Fix:** Create `babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

Then clear cache and restart:
```bash
npx expo start --clear
```

### 2. "Cannot find module 'babel-preset-expo'"

**Cause:** Missing devDependency

**Fix:**
```bash
npm install --save-dev babel-preset-expo --legacy-peer-deps
```

### 3. "[Reanimated] Failed to validate worklets version"

**Cause:** Missing `react-native-worklets` (required for Reanimated 4.x)

**Fix:**
```bash
npm install react-native-worklets --legacy-peer-deps
rm -rf ios
npx expo prebuild --platform ios
```

### 4. Peer Dependency Conflicts

```bash
npm install --legacy-peer-deps
```

Or in `eas.json`:
```json
{
  "env": {
    "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
  }
}
```

### 5. NativeWind Styles Not Applying

Add override in `package.json`:
```json
{
  "overrides": {
    "react-native-css-interop": "0.1.22"
  }
}
```

### 6. iOS Pod Install Failing

Nuclear option - regenerate iOS folder:
```bash
rm -rf ios node_modules
npm install --legacy-peer-deps
npx expo prebuild --platform ios
```

### 7. Build Failing Locally

```bash
npm run full-rebuild
```

### 8. Prebuild Check Before Submitting

```bash
npm run prebuild-check
```

### 9. RevenueCat "Error 23"

- Ensure API key is correct for environment (sandbox vs production)
- Check that product is configured in App Store Connect
- Verify entitlement ID matches exactly

### 10. Zustand Infinite Loop (React 18)

**Error:** `The result of getSnapshot should be cached to avoid an infinite loop`

**Cause:** Calling a function that returns a new object inside a Zustand selector.

**Bad:**
```typescript
// Creates new object every render → infinite loop
const weekTotals = useLogStore((state) => state.getWeekTotals());
```

**Good:**
```typescript
// Get function reference, then call it
const getWeekTotals = useLogStore((state) => state.getWeekTotals);
const weekTotals = getWeekTotals();
```

This applies to any store method that returns a computed value (objects, arrays).

---

## Quick Start Checklist

- [ ] Create Expo project: `npx create-expo-app@latest`
- [ ] Install dependencies (copy from above, including devDependencies)
- [ ] **Create `babel.config.js`** (CRITICAL - prevents white screen)
- [ ] **Create `metro.config.js`** with NativeWind
- [ ] **Create `tailwind.config.js`**
- [ ] **Create `global.css`** with Tailwind directives
- [ ] **Create `nativewind-env.d.ts`** for TypeScript
- [ ] **Create `index.ts`** entry point
- [ ] Set up folder structure
- [ ] Configure `app.json` with bundle ID
- [ ] Set up `eas.json`
- [ ] Create `.env` with API keys
- [ ] Set up PostHog analytics
- [ ] Set up RevenueCat (if monetizing)
- [ ] Create localStorage module
- [ ] Create Zustand stores
- [ ] Set up navigation with types
- [ ] Build onboarding flow
- [ ] Add analytics events throughout
- [ ] Test IAP in sandbox
- [ ] Run `prebuild-check` before submitting
- [ ] Submit with `build:ios:submit`

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [PostHog React Native](https://posthog.com/docs/libraries/react-native)
- [RevenueCat](https://www.revenuecat.com/docs/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
