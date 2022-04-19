import { Model } from '~/index';

import { sampleBookable } from './Bookable';
import { sampleSpace } from './Space';
import { sampleUser } from './User';

export const sampleBooking = new Model.Booking({
  start: new Date('2022-03-24T04:08:00.000Z'),
  end: new Date('2022-03-24T21:08:43.922Z'),
  bookedBy: sampleUser._id,
  bookable: sampleBookable._id,
  description: 'I need this table for the whole day.',
  space: sampleSpace._id,
});

export const sampleBookings = [sampleBooking];
