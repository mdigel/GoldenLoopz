/**
 * App Configuration
 * Toggle these settings during development
 *
 * USAGE:
 * - Set USE_DUMMY_DATA to `true` to see the app with 2 months of sample data
 * - Set USE_DUMMY_DATA to `false` to see the fresh/empty app experience
 *
 * NOTE: After changing this value, restart the app with cache clear:
 *   npx expo start --clear
 */

const LOCAL_DUMMY_DATA = false;

export const APP_CONFIG = {
  // Dummy data is never enabled in production builds.
  // Flip LOCAL_DUMMY_DATA to true for local/dev testing only.
  USE_DUMMY_DATA: __DEV__ && LOCAL_DUMMY_DATA,
};
