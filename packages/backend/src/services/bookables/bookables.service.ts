import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

const BookableSchema = new Schema<Model.Bookable>({
  name: { type: String, required: true },
  description: { type: String },
  space: { type: String, required: true },
});

export const name = 'bookables';

export const BookableModel = model<Model.Bookable & Document>(name, BookableSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: BookableModel,
  };

  app.use(name, new Service<Model.Bookable>(options));
};
