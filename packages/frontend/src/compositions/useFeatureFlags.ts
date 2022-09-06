import { useStorage } from '@vueuse/core';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useFeatureFlags() {
  return {
    allUnstableFeaturesEnabled: useStorage('bookyp.unstable_features', false),
  };
}
