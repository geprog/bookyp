import { Application, Service } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const preventInvalidDateRange = (context: HookContext<Application, Service.ServiceTypes['bookings']>) => {
  const { data } = context;
  if (Array.isArray(data)) {
    throw new Error('Only one booking can be created at a time');
  }
  if (data === undefined) {
    throw new Error('No data provided');
  }

  if (data.start === undefined || data.end === undefined) {
    throw new Error('Start and end dates are required');
  }

  if (data.end < data.start) {
    throw new Error('End date must be after start date');
  }

  return context;
};
