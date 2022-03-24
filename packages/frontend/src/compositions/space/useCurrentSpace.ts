import { Model } from '@bookyp/core';
import { Ref, ref, watch } from 'vue';

import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const spaceId: Ref<Model.Ref<Model.Space> | null> = ref(null);

watch(
  user,
  async (_user) => {
    if (_user) {
      // try to load saved spaceId
      spaceId.value = localStorage.getItem('spaceId');
      if (spaceId.value !== null) {
        return;
      }

      // try to load first space from own spaces
      const s = useFeathers().service('spaces');
      const spaces = (await s.find({
        paginate: false,
        query: { members: { $elemMatch: { userId: user.value?._id } } },
      })) as Model.Space[];

      if (spaces.length > 0) {
        spaceId.value = spaces[0]._id;
      }
    }
  },
  { immediate: true },
);

function setSpaceId(newSpaceId: string): void {
  spaceId.value = newSpaceId;
  localStorage.setItem('spaceId', newSpaceId);
}

export const useCurrentSpace = (): {
  currentSpace: Ref<Model.Space | undefined>;
  isLoading: Ref<boolean>;
  spaceId: Ref<Model.Ref<Model.Space> | null>;
  setSpaceId: (spaceId: Model.Ref<Model.Space>) => void;
} => {
  const { data: currentSpace, isLoading } = useGet('spaces', spaceId, ref());
  return { currentSpace, isLoading, spaceId, setSpaceId };
};
