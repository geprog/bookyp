import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, Model as MongooseModel, model, Schema } from 'mongoose';

const SpaceSchema = new Schema<Document, MongooseModel<Document, unknown>, Model.Space>({
  floorPlan: { type: Schema.Types.Array, required: true },
});

export const name = 'spaces';

export const SpaceModel = model<Model.Space & Document>(name, SpaceSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: SpaceModel,
  };

  app.use(name, new Service<Model.Space>(options));
};
