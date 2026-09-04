import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { getDownloadUrl } from '~/lib/fileUrls';

/**
 * Add a short-lived signed download url for the space image.
 * Only the object key is persisted, the url is created on every read.
 * @param context The hook context
 */
export default async function addImageUrl(
  context: HookContext<Application, AdapterService<Model.Space>>,
): Promise<HookContext<Application, AdapterService<Model.Space>>> {
  if (!context.result) {
    return context;
  }

  const spaces = Array.isArray(context.result) ? context.result : [context.result as Model.Space];

  await Promise.all(
    spaces.map(async (space) => {
      if (space.imageKey) {
        space.imageUrl = await getDownloadUrl(context.app, space.imageKey);
      }
    }),
  );

  return context;
}
