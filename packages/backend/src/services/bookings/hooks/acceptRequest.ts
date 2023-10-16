import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export function acceptRequest(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): HookContext<Application, AdapterService<Model.Booking>> {
  if (context.id && context.params.query?.accept === true) {
    // change the patch data so that a patch can only accept a booking
    context.data = { request: false };
  }
  return context;
}
