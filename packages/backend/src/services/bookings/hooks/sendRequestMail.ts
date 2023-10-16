import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext, Id, Params } from '@feathersjs/feathers';

import { sendRequestReplyNotification } from '~/mail';

function getAcceptFlag(params: Params): boolean | undefined {
  if (params.query?.accept !== undefined) {
    return params.query?.accept === true;
  }
  return undefined;
}

async function sendNotificationToUserMail(
  bookingId: Id,
  accept: boolean,
  context: HookContext<Application, AdapterService<Model.Booking>>,
) {
  const booking = await context.app.service('bookings').get(bookingId, { $disableSoftDelete: accept === false });
  if (!booking.request) {
    // when booking is no request we don't need to send a mail
    return;
  }

  const space = await context.app.service('spaces').get(booking.space);
  const currentBookable = await context.app.service('bookables').get(booking.bookable);
  const user = await context.app.service('users').get(booking.bookedBy);

  await sendRequestReplyNotification(space, user.email, currentBookable, booking, accept);
}

export function sendRequestNotificationMail(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): HookContext<Application, AdapterService<Model.Booking>> {
  const accept = getAcceptFlag(context.params);
  if (context.id && accept !== undefined) {
    // don't await to send emails in background
    void sendNotificationToUserMail(context.id, accept, context);
  }
  return context;
}
