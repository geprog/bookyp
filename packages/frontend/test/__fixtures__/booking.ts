import { Model } from '@bookyp/core';

export const sampleBooking: Model.Booking = {
  _id: '123',
  bookable: 'bookableId123',
  bookedBy: 'userId123',
  description: 'test description',
  end: new Date('2018-08-08T06:13:00'),
  start: new Date('2018-08-09T07:43:00'),
};

export const sampleAdditionalBooking: Model.Booking = {
  _id: '456',
  bookable: 'test-bookable-id',
  start: new Date('1995-12-17T07:24:00'),
  end: new Date('1995-12-17T07:24:00'),
  bookedBy: 'test-user-id',
  description: 'test-description',
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
  },
];
