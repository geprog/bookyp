import type { H3Event } from 'h3';
import type { SpaceAccess } from './access';
import type { DbBookable, DbSpace } from './dbTypes';
import type { CurrentUser } from './session';

/** Loads a bookable (deleted ones included) and checks the access to its space. */
export async function requireBookable(
  event: H3Event,
  bookableId: string | undefined,
  minimum: Exclude<SpaceAccess, 'none'>,
): Promise<{ bookable: DbBookable; space: DbSpace; user: CurrentUser | undefined; access: SpaceAccess }> {
  const { bookables } = await useCollections();
  const bookable = await bookables.findOne({ _id: toObjectId(bookableId) });
  if (!bookable) {
    throw createError({ statusCode: 404, statusMessage: 'Bookable not found' });
  }
  const { user, space, access } = await requireSpaceAccess(event, bookable.space, minimum);
  return { bookable, space, user, access };
}
