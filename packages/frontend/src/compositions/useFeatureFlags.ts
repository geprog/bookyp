import { getEnvConfig } from '@geprog/vite-plugin-env-config';
import { useStorage } from '@vueuse/core';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useFeatureFlags() {
  const enableUnstableFeatures =
    getEnvConfig('NODE_ENV') === 'development' || getEnvConfig('ENVIRONMENT_TYPE') === 'review';

  return {
    allUnstableFeaturesEnabled: useStorage('bookyp.unstable_features', enableUnstableFeatures),
  };
}
