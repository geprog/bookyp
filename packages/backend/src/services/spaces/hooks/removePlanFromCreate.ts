import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default function checkUserAlreadyInSpace(
  context: HookContext<Application, AdapterService<Model.Space>>,
): HookContext<Application, AdapterService<Model.Space>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(context.data)) {
    throw new Error('Multi create not supported');
  }
  delete context.data.plan;
  return context;
}
