import { useStorage } from '@vueuse/core';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useFeatureFlags() {
  const isNoneProduction =
    window.location.hostname === 'localhost' ||
    window.location.hostname.endsWith('.app.bookyp.de') ||
    window.location.hostname.endsWith('.gitpod.io');

  return {
    allUnstableFeaturesEnabled: useStorage('bookyp.unstable_features', isNoneProduction),
  };
}
