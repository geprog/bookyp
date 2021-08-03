import { Model } from '@bookyp/core';
import { UseGet } from '@geprog/use-feathers';
import { Ref, ref } from 'vue';

import useGet from '~/compositions/useGet';

// TODO: remove space id once it can be selected by the user
export const spaceId = ref('60f53bede6f8313dff7f99e0');

let internalSpace: Ref<Model.Space | undefined>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const internalIsLoading: Ref<Ref<boolean>> = ref(ref(false));

let alreadyLoaded = false;

export default function getCurrentSpace(): UseGet<Model.Space> {
  if (!alreadyLoaded) {
    const { data, isLoading } = useGet('spaces', spaceId, {
      disableUnloadingEventHandlers: true,
    });
    internalSpace = data;
    internalIsLoading.value = isLoading;
    alreadyLoaded = true;
  }
  return { data: internalSpace, isLoading: internalIsLoading.value };
}
