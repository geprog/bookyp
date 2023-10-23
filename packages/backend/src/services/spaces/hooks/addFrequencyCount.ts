import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';
import dayjs from 'dayjs';

import { getUser } from '~/utils';

export default async function addFrequencyCount(
  context: HookContext<Application, AdapterService<Model.Space>>,
): Promise<HookContext<Application, AdapterService<Model.Space>>> {
  const query = context.params.query as { $frequency?: boolean };
  const user = getUser(context.params);
  if (context.result && query.$frequency && user) {
    const spaces = Array.isArray(context.result) ? context.result : [context.result as Model.Space];

    const rawBookings = (await context.app.service('bookings').find({
      query: {
        bookedBy: user._id,
        start: {
          $gte: dayjs().subtract(30, 'days').toDate(),
        },
      },
    })) as Model.Booking[];

    const BookingsGroupedBySpaces = rawBookings.reduce((acc, obj) => {
      const id = obj.space;
      if (acc[id]) {
        acc[id].count++;
      } else {
        acc[id] = { spaceId: id, count: 1 };
      }
      return acc;
    }, {} as { [key: string]: { spaceId: string; count: number } });

    spaces.forEach((space) => {
      if (BookingsGroupedBySpaces[space._id]) {
        space.frequency = BookingsGroupedBySpaces[space._id].count;
      }
    });
  }
  return context;
}
