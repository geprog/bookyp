import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { sendSpaceBookingAdminMail } from '~/mail';

async function sendBookingEmails(
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

    const admin = space.email;
    if (admin === undefined) {
      return;
    }

    await sendSpaceBookingAdminMail(space, admin, user, currentBookable, booking);
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function sendBookingAdminMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): Promise<HookContext<Application, AdapterService<Model.Booking>>> {
  const bookingsData = context.result;

  if (bookingsData === undefined) {
    throw new Error('No data available');
  }
  const bookings = Array.isArray(bookingsData) ? bookingsData : [bookingsData as Model.Booking];

  // don't await to send emails in parallel to booking
  void sendBookingEmails(bookings, context);

  return context;
}
