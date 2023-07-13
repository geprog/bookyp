import { Model } from '@bookyp/core';
import { computed, inject, InjectionKey, Ref, ref } from 'vue';

const localStorageSpaceIdKey = 'bookyp.spaceId';

const _spaceId = ref(localStorage.getItem(localStorageSpaceIdKey));

export const savedSpaceId = computed<Model.Ref<Model.Space> | null>({
  get() {
    return _spaceId.value;
  },
  set(newSpaceId) {
    if (newSpaceId === null) {
      localStorage.removeItem(localStorageSpaceIdKey);
    } else {
      localStorage.setItem(localStorageSpaceIdKey, newSpaceId);
    }
    _spaceId.value = newSpaceId;
  },
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
