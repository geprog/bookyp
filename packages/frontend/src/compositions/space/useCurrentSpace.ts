import { Model } from '@bookyp/core';
import { UseGet } from '@geprog/use-feathers';
import { computed, Ref, ref } from 'vue';

import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

// TODO: remove space id once it can be selected by the user
let spaceId: Ref<Model.Ref<Model.Space> | null>;

let currentSpace: UseGet<Model.Space>;

export const useCurrentSpace = (): {
  currentSpace: Ref<Model.Space | undefined>;
  isLoading: Ref<boolean>;
  spaceId: Ref<Model.Ref<Model.Space> | null>;
} => {
  if (spaceId === undefined) {
    const { data: spaces } = useFind(
      'spaces',
      computed(() => ({ paginate: false, query: { members: { $elemMatch: { userId: user.value?._id } } } })),
      {
        disableUnloadingEventHandlers: true,
      },
    );

    spaceId = computed(() => {
      if (spaces.value.length > 0) {
        return spaces.value[0]._id;
      }
      return null;
    });
  }

  if (!currentSpace) {
    currentSpace = useGet('spaces', spaceId, ref(), {
      disableUnloadingEventHandlers: true,
    });
  }

  return { currentSpace: currentSpace.data, isLoading: currentSpace.isLoading, spaceId };
};
