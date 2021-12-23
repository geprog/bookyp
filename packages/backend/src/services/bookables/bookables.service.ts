import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import softDelete from '~/hooks/softDelete';

const BookableSchema = new Schema<Model.Bookable>({
  name: { type: String, required: true },
  description: { type: String },
  space: { type: String, required: true },
  deleted: { type: Boolean },
});

export const name = 'bookables';

export const BookableModel = model<Model.Bookable & Document>(name, BookableSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: BookableModel,
    whitelist: ['$disableSoftDelete'],
  };

  app.use(name, new Service<Model.Bookable>(options));
  app.service(name).hooks({
    before: {
      all: [softDelete],
    },
  });
};
