/** unstable features are enabled in development and review environments */
export function useFeatureFlags() {
  const { environmentType } = useRuntimeConfig().public;
  const enableUnstableFeatures = environmentType === 'development' || environmentType === 'review';
  const allUnstableFeaturesEnabled = useLocalStorage('bookyp.unstable_features', enableUnstableFeatures);
  return { allUnstableFeaturesEnabled };
}
