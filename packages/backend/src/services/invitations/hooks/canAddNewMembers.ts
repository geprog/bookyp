import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';
import dayjs from 'dayjs';

export default async function canAddNewMembers(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(context.data)) {
    throw new Error('Only one invitation can be created at a time');
  }
  const { spaceId } = context.data;
  if (spaceId === undefined) {
    throw new Error('spaceId should be defined');
  }
  const space = await context.app.service('spaces').get(spaceId);
  const invitations = (await context.app.service('invitations').find({ query: { spaceId } })) as Model.Invitation[];
  if (space.plan === 'free' && space.members.length + invitations.length < 10) {
    return context;
  }
  if (space.plan !== 'free' && space.activeUntil && dayjs(space.activeUntil).isAfter(dayjs())) {
    return context;
  }
  throw new Error('Adding new members not allowed');
}
