import { Application, Model, Service } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const preventOverlappingBookings = async (
  context: HookContext<Application, Service.ServiceTypes['bookings']>,
) => {
  const { service, data } = context;
  if (Array.isArray(data)) {
    throw new Error('Only one booking can be created at a time');
  }
  if (data === undefined) {
    throw new Error('No data provided');
  }

  const existingBookings = (await service.find({
    query: {
      bookable: data.bookable,
      start: { $lt: data.end },
      end: { $gt: data.start },
    },
  })) as Model.Booking[];

  if (existingBookings.length > 0) {
    throw new Error('Booking overlaps with existing bookings');
  }

  return context;
};
