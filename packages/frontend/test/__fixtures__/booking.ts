import { Model } from '@bookyp/core';
import dayjs from 'dayjs';

export const sampleBooking: Model.Booking = {
  _id: '123',
  bookable: 'bookableId123',
  bookedBy: 'userId123',
  description: 'test description',
  end: dayjs('2018-08-08').toDate(),
  start: dayjs('2018-08-09').toDate(),
};
