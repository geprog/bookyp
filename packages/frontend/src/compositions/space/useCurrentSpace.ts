import { Model } from '@bookyp/core';
import { computed, ComputedRef, Ref, ref } from 'vue';

import useFind from '~/compositions/useFind';

const internalSpaces: Ref<Ref<Model.Space[] | undefined> | undefined> = ref(undefined);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const internalIsLoading: Ref<Ref<boolean>> = ref(ref(false));

const currentSpace = computed(() => {
  if (internalSpaces.value === undefined || !internalSpaces.value.value?.length) {
    return undefined;
  }
  return internalSpaces.value.value[0];
});
let alreadyLoaded = false;

export default function getCurrentSpace(): { data: ComputedRef<Model.Space | undefined>; isLoading: Ref<boolean> } {
  if (!alreadyLoaded) {
    const { data, isLoading } = useFind('spaces', ref({ paginate: false, query: {} }), {
      disableUnloadingEventHandlers: true,
    });
    internalSpaces.value = data;
    internalIsLoading.value = isLoading;
    alreadyLoaded = true;
  }
  return { data: currentSpace, isLoading: internalIsLoading.value };
}
