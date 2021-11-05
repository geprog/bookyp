import { Model } from '@bookyp/core';

import { sampleAdditionalBookable, sampleBookable } from './bookable';
import { sampleSpace } from './space';

export const sampleBooking: Model.Booking = {
  _id: '123',
  bookable: sampleBookable._id,
  bookedBy: 'userId123',
  description: 'test description',
  start: new Date('2018-08-08T07:43:00'),
  end: new Date('2018-08-08T08:13:00'),
  space: sampleSpace._id,
};

export const sampleAdditionalBooking: Model.Booking = {
  _id: '456',
  bookable: sampleAdditionalBookable._id,
  start: new Date('1995-12-17T07:24:00'),
  end: new Date('1995-12-17T07:24:00'),
  bookedBy: 'test-user-id',
  description: 'test-description',
  space: sampleSpace._id,
};

export const sampleBookings: Model.Booking[] = [
  sampleBooking,
  sampleAdditionalBooking,
  {
    _id: '789',
    start: new Date('1995-12-18T03:24:00'),
    end: new Date('1995-12-18T07:24:00'),
    bookedBy: 'test-user-id',
    bookable: 'test-bookable-id',
    description: 'test-description',
    space: sampleSpace._id,
  },
];
