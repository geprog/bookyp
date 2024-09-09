import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';

import accept from './hooks/accept';
import addSpaceName from './hooks/addSpaceName';
import canAddNewMembers from './hooks/canAddNewMembers';
import checkUserAlreadyInSpace from './hooks/checkUserAlreadyInSpace';
import emailToLowerCase from './hooks/emailToLowerCase';
import queryForDirectAndDomainInvitations from './hooks/queryForDirectAndDomainInvitations';
import sendSpaceInvitationMail from './hooks/sendInvitationMail';

const InvitationSchema = new Schema<Model.Invitation>({
  role: { type: String, required: true },
  email: { type: String, required: true },
  spaceId: { type: String, required: true },
  rejectedBy: [String],
});
// order of fields matters for error message
InvitationSchema.index({ spaceId: 1, email: 1 }, { unique: true });

export const name = 'invitations';

export const InvitationModel = model<Model.Invitation>(name, InvitationSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: InvitationModel,
    whitelist: ['$elemMatch', ...feathersCaslAllowlist],
  };

  app.use(name, new Service<Model.Invitation>(options));
  app.service(name).hooks({
    before: {
      find: [queryForDirectAndDomainInvitations],
      create: [emailToLowerCase, canAddNewMembers, checkUserAlreadyInSpace, sendSpaceInvitationMail],
      remove: [accept],
    },
    after: {
      all: [addSpaceName],
    },
  });
};
