import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default function emailToLowerCase(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): HookContext<Application, AdapterService<Model.Invitation>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(context.data)) {
    throw new Error('Only one invitation can be created at a time');
  }
  const { email } = context.data;
  if (email === undefined) {
    throw new Error('Email should be defined');
  }

  context.data.email = email.toLowerCase();

  return context;
}
