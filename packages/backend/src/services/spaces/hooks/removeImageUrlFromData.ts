import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

/**
 * Drop the signed `imageUrl` from incoming data. It is derived from `imageKey` on
 * every read, so it must never be written to the database - the frontend sends the
 * whole space back on patch and would otherwise persist an expired url.
 * @param context The hook context
 */
export default function removeImageUrlFromData(
  context: HookContext<Application, AdapterService<Model.Space>>,
): HookContext<Application, AdapterService<Model.Space>> {
  const { data } = context;
  if (data === undefined) {
    return context;
  }

  const spaces = Array.isArray(data) ? data : [data];
  spaces.forEach((space) => {
    delete space.imageUrl;
  });

  return context;
}
