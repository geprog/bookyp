import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { sendAdminNotification } from '~/mail';
import { requireUser } from '~/utils';

async function sendNotificationToAdminMail(
  bookings: Model.Booking[],
  context: HookContext<Application, AdapterService<Model.Booking>>,
) {
  const user = requireUser(context.params);

  for await (const booking of bookings) {
    const { space: spaceId } = booking;
    const { bookable } = booking;

    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }

    const space = await context.app.service('spaces').get(spaceId);
    const currentBookable = await context.app.service('bookables').get(bookable);

    const email = space.email;
    if (email === undefined) {
      return;
    }

    await sendAdminNotification(space, email, user, currentBookable, booking);
  }
}

export function sendBookingNotificationMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): HookContext<Application, AdapterService<Model.Booking>> {
  const bookingsData = context.result;

  if (bookingsData === undefined) {
    throw new Error('No data available');
  }
  const bookings = Array.isArray(bookingsData) ? bookingsData : [bookingsData as Model.Booking];

  // don't await to send emails in background
  void sendNotificationToAdminMail(bookings, context);

  return context;
}
