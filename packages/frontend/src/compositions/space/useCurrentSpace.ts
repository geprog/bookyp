import { Model } from '@bookyp/core';
import { useStorage } from '@vueuse/core';
import { computed, inject, InjectionKey, Ref, watch } from 'vue';

const localStoragePrefix = 'bookyp.';

export const recentlyViewedSpaces = useStorage<Record<Model.Ref<Model.Space>, number>>(
  `${localStoragePrefix}recently_viewed_spaces`,
  {},
);

export const savedSpaceId = useStorage<Model.Ref<Model.Space> | null>(`${localStoragePrefix}spaceId`, null);
watch(savedSpaceId, (spaceId) => {
  if (spaceId) {
    recentlyViewedSpaces.value = { ...recentlyViewedSpaces.value, [spaceId]: new Date().getTime() };

    // Sort recently viewed spaces by date and keep only the 5 most recent
    recentlyViewedSpaces.value = Object.entries(recentlyViewedSpaces.value)
      .map(([_spaceId, accessesAt]) => ({ spaceId: _spaceId, accessesAt }))
      .sort((a, b) => b.accessesAt - a.accessesAt)
      .slice(0, 5)
      .reduce((acc, { spaceId: _spaceId, accessesAt }) => ({ ...acc, [_spaceId]: accessesAt }), {});
  }
});

export const currentSpaceInjectionKey: InjectionKey<Ref<Model.Space | undefined>> = Symbol('currentSpace');

export const useCurrentSpace = (): {
  currentSpace: Ref<Model.Space | undefined>;
  spaceId: Ref<string | undefined>;
} => {
  const currentSpace = inject(currentSpaceInjectionKey);

  if (!currentSpace) {
    throw new Error('useCurrentSpace must be used inside a component inside SpaceLoader');
  }
  const spaceId = computed(() => currentSpace.value?._id);

  return { currentSpace, spaceId };
};
