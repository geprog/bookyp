import { Model } from '@bookyp/core';

import useFeathers from '~/compositions/useFeathers';

/**
 * the download urls handed out by the backend are short-lived, so the ones in a page that has been open for a long time can expire.
 * spaces that failed once are remembered to avoid retrying forever if the image is gone for good.
 */
const refreshedSpaces = new Set<Model.Ref<Model.Space>>();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSpaceImage() {
  const feathers = useFeathers();

  /**
   * Load a fresh signed image url for a space whose image failed to load.
   * @param space The space with the broken image url
   */
  async function refreshImage(space: Partial<Model.Space>): Promise<void> {
    const spaceId = space._id;
    if (!spaceId || !space.imageUrl || refreshedSpaces.has(spaceId)) {
      return;
    }
    refreshedSpaces.add(spaceId);

    const freshSpace = await feathers.service('spaces').get(spaceId);
    space.imageUrl = freshSpace.imageUrl;
  }

  return { refreshImage };
}
