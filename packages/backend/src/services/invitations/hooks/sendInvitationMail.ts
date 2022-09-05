import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { sendSpaceInvitationMail } from '~/mail';

export default async function sendInvitationMail(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(context.data)) {
    throw new Error('Only one invitation can be created at a time');
  }
  const { spaceId, email } = context.data;
  if (spaceId === undefined) {
    throw new Error('spaceId should be defined');
  }
  if (email === undefined) {
    throw new Error('Email should be defined');
  }
  const space = await context.app.service('spaces').get(spaceId);

  const { user } = context.params as { user: Model.User };

  const admin = space.members.find((member) => member.email === user.email);
  if (admin === undefined) {
    throw new Error('User is not an admin of the space');
  }

  void sendSpaceInvitationMail(space, email, admin);

  return context;
}
