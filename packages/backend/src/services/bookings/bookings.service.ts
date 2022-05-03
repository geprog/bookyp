import { Application, Model } from '@bookyp/core';
import { authenticate } from '@feathersjs/authentication';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { authorizeWithFreshAbility, feathersCaslAllowlist } from '~/casl';

import { preventOverlappingBookings } from './hooks/preventOverlappingBookings';

const BookingSchema = new Schema<Model.Booking>({
  start: { type: Schema.Types.Date, required: true },
  end: { type: Schema.Types.Date, required: true },
  bookedBy: { type: String, required: true },
  bookable: { type: String, required: true },
  description: { type: String },
  space: { type: String, required: true },
});

export const name = 'bookings';

export const BookingsModel = model<Model.Booking & Document>(name, BookingSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: BookingsModel,
    whitelist: feathersCaslAllowlist,
  };

  app.use(name, new Service<Model.Booking>(options));
  app.service(name).hooks({
    before: {
      all: [authenticate('jwt'), authorizeWithFreshAbility],
      create: [preventOverlappingBookings],
    },
    after: {
      all: [authorizeWithFreshAbility],
    },
  });
};
