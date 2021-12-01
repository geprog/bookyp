import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

const SpaceSchema = new Schema<Model.Space>({
  floorPlan: { type: [String], required: true },
  members: [
    {
      role: String,
      userId: String,
    },
  ],
});

export const name = 'spaces';

export const SpaceModel = model<Model.Space & Document>(name, SpaceSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: SpaceModel,
    whitelist: ['$elemMatch'],
  };

  app.use(name, new Service<Model.Space>(options));
};
