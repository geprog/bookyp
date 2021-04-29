import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, Model as MongooseModel, model, Schema } from 'mongoose';

const MapObjectSchema = new Schema<Document, MongooseModel<Document, unknown>, Model.MapObject>({
  xPos: { type: Number, required: true },
  yPos: { type: Number, required: true },
  rotation: { type: Number, required: true },
  paths: { type: Schema.Types.Array, required: true },
  type: { type: String, enum: Object.values(Model.MapObjectTypes), required: true },
  bookable: String,
});

export const name = 'mapObjects';

export const MapObjectModel = model<Model.MapObject & Document>(name, MapObjectSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: MapObjectModel,
  };

  app.use(name, new Service<Model.MapObject>(options));
};
