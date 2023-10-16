import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';
import softDelete from '~/hooks/softDelete';

import { acceptRequest } from './hooks/acceptRequest';
import { checkIsRequest } from './hooks/checkIsRequest';
import { preventInvalidDateRange } from './hooks/preventInvalidDateRange';
import { preventOverlappingBookings } from './hooks/preventOverlappingBookings';
import { sendBookingNotificationMail } from './hooks/sendBookingNotificationMail';
import { sendRequestNotificationMail } from './hooks/sendRequestMail';

const BookingSchema = new Schema<Model.Booking>({
  start: { type: Schema.Types.Date, required: true },
  end: { type: Schema.Types.Date, required: true },
  bookedBy: { type: String, required: true },
  bookable: { type: String, required: true },
  description: { type: String },
  space: { type: String, required: true },
  request: { type: Boolean, required: false },
  deleted: { type: Boolean },
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
      all: [softDelete],
      create: [checkIsRequest, preventInvalidDateRange, preventOverlappingBookings],
      remove: [sendRequestNotificationMail],
      update: [checkIsRequest],
      patch: [checkIsRequest, acceptRequest, sendRequestNotificationMail],
    },
    after: {
      create: [sendBookingNotificationMail],
    },
  });
};
