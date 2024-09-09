import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';
import softDelete from '~/hooks/softDelete';
import { cancelSubscription, updateSpaceSubscription } from '~/lib/paymentsApi';
import { getUser } from '~/utils';

import addFrequencyCount from './hooks/addFrequencyCount';
import addIsUserAdmin from './hooks/addIsUserAdmin';
import addIsUserMember from './hooks/addIsUserMember';
import addSpaceMemberFields from './hooks/addSpaceMemberFields';
import { applyFreeBookableFilter } from './hooks/applyFreeBookableFilter';
import { cleanupUploadedFiles } from './hooks/cleanupUploadedFiles';
import removePlanFromCreate from './hooks/removePlanFromCreate';

const SpaceSchema = new Schema<Model.Space>({
  floorPlan: { type: [String], required: true },
  members: [
    {
      role: String,
      userId: String,
    },
  ],
  name: { type: String, required: true },
  description: { type: String },
  generalInformation: { type: String },
  address: { type: String },
  plan: { type: String, default: 'free' },
  subscription: { type: String },
  activeUntil: { type: Date, default: undefined },
  email: { type: String },
  image: { type: String },
  deleted: { type: Boolean },
  coordinates: { lng: Number, lat: Number },
  importId: { type: String },
  isPublic: { type: Boolean },
  phone: { type: String },
  website: { type: String },
  bookingsAndRequests: { type: String },
});

export const name = 'spaces';

export const SpaceModel = model<Model.Space>(name, SpaceSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: SpaceModel,
    whitelist: [
      '$elemMatch',
      '$exists',
      '$freeBookable',
      '$frequency',
      '$isUserMember',
      '$isUserAdmin',
      ...feathersCaslAllowlist,
    ],
  };

  app.use(name, new Service<Model.Space>(options));
  app.service(name).hooks({
    before: {
      all: [softDelete, applyFreeBookableFilter],
      create: [removePlanFromCreate],
      remove: [
        async (ctx) => {
          if (!ctx.id) {
            throw new Error('No space id provided');
          }
          const space = await ctx.service.get(ctx.id);
          if (space.subscription) {
            await cancelSubscription(space);
          }
        },
      ],
    },
    after: {
      all: [addSpaceMemberFields, cleanupUploadedFiles, addFrequencyCount, addIsUserMember, addIsUserAdmin],
      patch: [
        // update subscription if plan changed by super admin
        async (ctx) => {
          const user = getUser(ctx.params);
          if (user?.isSuperAdmin && !Array.isArray(ctx.data) && ctx.data?.plan && ctx.result) {
            const space = ctx.result as Model.Space;
            if (!space.subscription) {
              return;
            }

            // set the subscription to 'free' in gringotts to stop the payment
            // process while still having a higher plan in bookyp itself
            await updateSpaceSubscription({ ...space, plan: 'free' });
          }
        },
      ],
    },
  });
};
