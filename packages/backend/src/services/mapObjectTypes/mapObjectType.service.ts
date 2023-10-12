import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';

const MapObjectTypeSchema = new Schema<Model.MapObjectType>({
  name: { type: String, required: true },
  paths: { type: [String], required: true },
  bgPaths: { type: [String] },
  viewBox: { type: String, required: true },
  spaceId: { type: String, required: true },
});

export const name = 'mapObjectTypes';

export const MapObjectTypeModel = model<Model.MapObjectType & Document>(name, MapObjectTypeSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: MapObjectTypeModel,
    whitelist: feathersCaslAllowlist,
  };

  app.use(name, new Service<Model.MapObjectType>(options));
};
