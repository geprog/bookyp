import { Application, Model } from '@bookyp/core';
import { authenticate } from '@feathersjs/authentication';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { authorizeWithFreshAbility, feathersCaslAllowlist } from '~/casl';

import accept from './accept.hook';
import addSpaceName from './addSpaceName.hook';
import checkUserAlreadyInSpace from './checkUserAlreadyInSpace.hook';
import emailToLowerCase from './emailToLowerCase.hook';
import sendSpaceInvitationMail from './sendInvitationMail';

const InvitationSchema = new Schema<Model.Invitation>({
  role: { type: String, required: true },
  email: { type: String, required: true },
  spaceId: { type: String, required: true },
});
// order of fields matters for error message
InvitationSchema.index({ spaceId: 1, email: 1 }, { unique: true });

export const name = 'invitations';

export const InvitationModel = model<Model.Invitation & Document>(name, InvitationSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: InvitationModel,
    whitelist: ['$elemMatch', ...feathersCaslAllowlist],
  };

  app.use(name, new Service<Model.Invitation>(options));
  app.service(name).hooks({
    before: {
      all: [authenticate('jwt'), authorizeWithFreshAbility],
      create: [emailToLowerCase, checkUserAlreadyInSpace, sendSpaceInvitationMail],
      remove: [accept],
    },
    after: {
      all: [addSpaceName, authorizeWithFreshAbility],
    },
  });
};
