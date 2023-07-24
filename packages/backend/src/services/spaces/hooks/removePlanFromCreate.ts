import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default function checkUserAlreadyInSpace(
  context: HookContext<Application, AdapterService<Model.Space>>,
): HookContext<Application, AdapterService<Model.Space>> {
  const { data, params } = context;
  const { user } = params as { user: Model.User };
  if (data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(data)) {
    throw new Error('Multi create not supported');
  }
  if (!user.isSuperAdmin) {
    delete data.plan;
  }
  return context;
}
