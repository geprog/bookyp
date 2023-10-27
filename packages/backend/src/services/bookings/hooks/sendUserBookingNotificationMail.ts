import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { sendUserBookingNotification } from '~/mail';
import { requireUser } from '~/utils';

async function sendNotificationToUserMail(
  bookings: Model.Booking[],
  oldBookings: Model.Booking[],
  context: HookContext<Application, AdapterService<Model.Booking>>,
) {
  const currentUser = requireUser(context.params);

  let index = 0;
  for await (const booking of bookings) {
    const oldBooking = oldBookings[index];
    const { space: spaceId, bookable, bookedBy } = booking;
    if (bookedBy === currentUser._id.toString()) {
      // we are only interested by changes done by other users than the one that has booked
      continue;
    }

    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }

    const space = await context.app.service('spaces').get(spaceId);
    const user = await context.app.service('users').get(bookedBy);
    const currentBookable = await context.app.service('bookables').get(bookable);

    await sendUserBookingNotification(space, user, currentBookable, oldBooking, booking);
    index++;
  }
}

export async function sendUserBookingNotificationMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): Promise<HookContext<Application, AdapterService<Model.Booking>>> {
  let bookings: Model.Booking[];
  let oldBookings: Model.Booking[];
  if (context.method === 'update') {
    const bookingsData = context.data;

    if (bookingsData === undefined) {
      throw new Error('No data available');
    }
    bookings = Array.isArray(bookingsData) ? (bookingsData as Model.Booking[]) : [bookingsData as Model.Booking];
    oldBookings = await Promise.all(bookings.map((booking) => context.app.service('bookings').get(booking._id)));
  } else if (context.method === 'remove') {
    const bookingId = context.id;

    if (bookingId === undefined) {
      throw new Error('No data available');
    }
    // we need to request with $disableSoftDelete: true because the soft delete hook already deleted the booking
    const booking = await context.app.service('bookings').get(bookingId, { $disableSoftDelete: true });
    if (booking.request) {
      return context;
    }
    bookings = [booking];
    oldBookings = [booking];
  } else {
    throw new Error('Hook not supported in this context');
  }

  // don't await to send emails in background
  void sendNotificationToUserMail(bookings, oldBookings, context);

  return context;
}
