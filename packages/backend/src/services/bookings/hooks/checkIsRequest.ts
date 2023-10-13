import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export async function checkIsRequest(
  context: HookContext<Application, AdapterService<Model.Booking>>,
): Promise<HookContext<Application, AdapterService<Model.Booking>>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(context.data)) {
    throw new Error('Only one booking can be created at a time');
  }
  const { space: spaceId } = context.data;
  if (spaceId === undefined) {
    throw new Error('spaceId should be defined');
  }

  const space = await context.app.service('spaces').get(spaceId);

  const booking = context.data as Model.Booking;
  const isUserMember = space.members.some((member) => member.userId === booking.bookedBy);

  if (space.bookingsAndRequests === 'only_info') {
    throw new Error('Bookings and Requests are not allowed for this space.');
  }

  if (
    space.bookingsAndRequests === 'requests' ||
    (space.bookingsAndRequests === 'both' && space.isPublic && !isUserMember)
  ) {
    booking.request = true;
  }

  return context;
}
