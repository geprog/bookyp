import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { sendNotificationToUserMail as _sendNotificationToUserMail } from '~/mail';

async function sendNotificationToUserMail(
  bookings: Model.Booking[],
  context: HookContext<Application, AdapterService<Model.Booking>>,
) {
  for await (const booking of bookings) {
    const { space: spaceId, bookable, bookedBy } = booking;

    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }

    if (bookable === undefined) {
      throw new Error('bookableId should be defined');
    }

    if (bookedBy === undefined) {
      throw new Error('userId should be defined');
    }

    const space = await context.app.service('spaces').get(spaceId);
    const currentBookable = await context.app.service('bookables').get(bookable);
    const user = await context.app.service('users').get(bookedBy);

    if (context.params.query?.accept !== undefined) {
      await _sendNotificationToUserMail(
        space,
        user.email,
        currentBookable,
        booking,
        context.params.query?.accept === true,
      );
    }
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function sendAcceptRequestNotificationMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): Promise<HookContext<Application, AdapterService<Model.Booking>>> {
  const bookingsData = context.data as Model.Booking;

  if (bookingsData === undefined) {
    throw new Error('No data available');
  }
  const bookings = Array.isArray(bookingsData) ? bookingsData : [bookingsData];

  // don't await to send emails in background
  void sendNotificationToUserMail(bookings, context);

  return context;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function sendRejectRequestNotificationMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): Promise<HookContext<Application, AdapterService<Model.Booking>>> {
  const bookingsData = context.result as Model.Booking;

  if (bookingsData === undefined) {
    throw new Error('No data available');
  }
  const bookings = Array.isArray(bookingsData) ? bookingsData : [bookingsData];

  // don't await to send emails in background
  void sendNotificationToUserMail(bookings, context);

  return context;
}
