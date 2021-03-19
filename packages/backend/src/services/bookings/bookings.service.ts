import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

const BookingSchema = new Schema<Model.Booking>({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  bookedBy: { type: String, required: true },
  bookable: { type: String, required: true },
  description: { type: String },
});

export const name = 'bookings';

export const BookingsModel = model<Model.Booking & Document>(name, BookingSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: BookingsModel,
  };

  app.use(name, new Service<Model.Booking>(options));
};
