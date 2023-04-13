import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export async function applyFreeBookableFilter(
  context: HookContext<Application, AdapterService<Model.Space>>,
): Promise<HookContext<Application, AdapterService<Model.Space>>> {
  const query = context.params.query as { $freeBookable?: { start?: string; end?: string }; _id?: { $in: string[] } };

  if (query.$freeBookable && query.$freeBookable.start && query.$freeBookable.end) {
    const start = new Date(query.$freeBookable.start);
    const end = new Date(query.$freeBookable.end);

    const bookingsAtThatTime = (await context.app.service('bookings').find({
      query: {
        start: { $lt: end?.toISOString() },
        end: { $gt: start?.toISOString() },
      },
      paginate: false,
    })) as Model.Booking[];

    const removeDuplicates = (acc: string[]) => Array.from(new Set(acc).values());

    const occupiedBookables = removeDuplicates(bookingsAtThatTime.map((booking) => booking.bookable));

    const freeBookables = (await context.app.service('bookables').find({
      query: {
        _id: { $nin: occupiedBookables },
      },
      paginate: false,
    })) as Model.Bookable[];

    const spaceIds = removeDuplicates(freeBookables.map((bookable) => bookable.space));

    query._id = { $in: spaceIds };
    context.query = query;
  }

  delete context.params.query?.$start;
  delete context.params.query?.$end;

  return context;
}
