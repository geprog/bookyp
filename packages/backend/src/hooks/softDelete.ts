import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export function extractSoftDeleteFlag(context: HookContext): HookContext {
  if (context.params.query && context.params.query.$disableSoftDelete) {
    context.params.$disableSoftDelete = context.params.query.$disableSoftDelete as boolean;
    delete context.params.query.$disableSoftDelete;
  }

  return context;
}

export default async <T extends Model.AbstractEntity>(
  context: HookContext<Application, AdapterService<T>>,
): Promise<HookContext<Application, AdapterService<T>>> => {
  const { service, method, params } = context;
  const { query = {} } = params;

  if (context.type !== 'before') {
    throw new Error(`The softDelete hook can only be used as a before hook!!!`);
  }

  if (params.$disableSoftDelete === true) {
    delete params.$disableSoftDelete;
    return context;
  }

  context.params.query = Object.assign({}, query, { deleted: { $ne: true } });
  if (method === 'remove') {
    if (context.id !== undefined) {
      const result = await service.patch(context.id, { deleted: true } as Partial<T>, params);
      context.result = result;
    }
  }
  return context;
};
