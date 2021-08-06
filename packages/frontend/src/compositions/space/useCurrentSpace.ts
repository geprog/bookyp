import { Model } from '@bookyp/core';
import { UseGet } from '@geprog/use-feathers';
import { ref } from 'vue';

import useGet from '~/compositions/useGet';

// TODO: remove space id once it can be selected by the user
export const spaceId = ref('60f53bede6f8313dff7f99e0');

let currentSpace: UseGet<Model.Space>;

export default function getCurrentSpace(): UseGet<Model.Space> {
  if (!currentSpace) {
    currentSpace = useGet('spaces', spaceId, {
      disableUnloadingEventHandlers: true,
    });
  }
  return currentSpace;
}
