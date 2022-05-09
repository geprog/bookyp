import { Application, Model } from '@bookyp/core';
import { authenticate } from '@feathersjs/authentication';
import { authorize } from 'feathers-casl';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';

import addSpaceMemberFields from './addSpaceMemberFields.hook';

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
  address: { type: String },
});

export const name = 'spaces';

export const SpaceModel = model<Model.Space & Document>(name, SpaceSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: SpaceModel,
    whitelist: ['$elemMatch', ...feathersCaslAllowlist],
  };

  app.use(name, new Service<Model.Space>(options));
  app.service(name).hooks({
    before: {
      all: [authenticate('jwt'), authorize({ adapter: 'feathers-mongoose' })],
    },
    after: {
      all: [addSpaceMemberFields, authorize({ adapter: 'feathers-mongoose' })],
    },
  });
};
