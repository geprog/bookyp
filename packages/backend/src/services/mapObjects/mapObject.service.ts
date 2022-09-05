import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';

const MapObjectSchema = new Schema<Model.MapObject>({
  xPos: { type: Number, required: true },
  yPos: { type: Number, required: true },
  rotation: { type: Number, required: true },
  paths: { type: [String], required: true },
  type: { type: String, enum: Object.values(Model.MapObjectTypes), required: true },
  bookable: String,
  space: { type: String, required: true },
});

export const name = 'mapObjects';

export const MapObjectModel = model<Model.MapObject & Document>(name, MapObjectSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: MapObjectModel,
    whitelist: feathersCaslAllowlist,
  };

  app.use(name, new Service<Model.MapObject>(options));
};
