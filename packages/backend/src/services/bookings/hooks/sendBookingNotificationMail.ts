import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { sendBookingNotificationToAdminMail as _sendBookingNotificationToAdminMail } from '~/mail';

async function sendBookingNotificationToAdminMail(
  bookings: Model.Booking[],
  context: HookContext<Application, AdapterService<Model.Booking>>,
) {
  for await (const booking of bookings) {
    const { space: spaceId } = booking;
    const { bookable } = booking;

    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }

    const space = await context.app.service('spaces').get(spaceId);
    const currentBookable = await context.app.service('bookables').get(bookable);

    const { user } = context.params as { user: Model.User };

    const email = space.email;
    if (email === undefined) {
      return;
    }

    await _sendBookingNotificationToAdminMail(space, email, user, currentBookable, booking);
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function sendBookingNotificationMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): Promise<HookContext<Application, AdapterService<Model.Booking>>> {
  const bookingsData = context.result;

  if (bookingsData === undefined) {
    throw new Error('No data available');
  }
  const bookings = Array.isArray(bookingsData) ? bookingsData : [bookingsData as Model.Booking];

  // don't await to send emails in background
  void sendBookingNotificationToAdminMail(bookings, context);

  return context;
}
