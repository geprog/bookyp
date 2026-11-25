import type { H3Event } from 'h3';
import type { ObjectId } from 'mongodb';
import type { MemberRole, PublicSpace, Space } from '#shared/types/models';
import type { DbSpace } from './dbTypes';
import type { CurrentUser } from './session';

/**
 * How much a user is allowed to see / do in a space.
 * - admin: full access (space admins and super admins)
 * - member: a user that was invited to the space
 * - public: anyone can look at a public space
 * - none: the space is invisible to the user
 */
export type SpaceAccess = 'admin' | 'member' | 'public' | 'none';

const accessLevels: Record<SpaceAccess, number> = { none: 0, public: 1, member: 2, admin: 3 };

export function getSpaceRole(space: Pick<DbSpace, 'members'>, user?: Pick<CurrentUser, '_id'>): MemberRole | null {
  if (!user) {
    return null;
  }
  return space.members?.find(member => member.userId === user._id)?.role ?? null;
}

export function getSpaceAccess(space: Pick<DbSpace, 'members' | 'isPublic'>, user?: CurrentUser): SpaceAccess {
  if (user?.isSuperAdmin) {
    return 'admin';
  }
  const role = getSpaceRole(space, user);
  if (role === 'admin') {
    return 'admin';
  }
  if (role === 'user') {
    return 'member';
  }
  return space.isPublic ? 'public' : 'none';
}

export function hasAccess(access: SpaceAccess, minimum: SpaceAccess): boolean {
  return accessLevels[access] >= accessLevels[minimum];
}

/** the mongo filter for all spaces the user is allowed to see */
export function visibleSpacesFilter(user?: CurrentUser): Record<string, unknown> {
  const notDeleted = { deleted: { $ne: true } };
  if (user?.isSuperAdmin) {
    return notDeleted;
  }
  if (!user) {
    return { ...notDeleted, isPublic: true };
  }
  return { ...notDeleted, $or: [{ isPublic: true }, { members: { $elemMatch: { userId: user._id } } }] };
}

/** ids of all spaces the user administrates */
export async function getAdminSpaceIds(user: CurrentUser): Promise<string[]> {
  const { spaces } = await useCollections();
  const filter = user.isSuperAdmin
    ? { deleted: { $ne: true } }
    : { deleted: { $ne: true }, members: { $elemMatch: { userId: user._id, role: 'admin' } } };
  const docs = await spaces.find(filter, { projection: { _id: 1 } }).toArray();
  return docs.map(doc => doc._id.toString());
}

export async function loadSpace(spaceId: string | ObjectId | undefined, options: { includeDeleted?: boolean } = {}): Promise<DbSpace> {
  const { spaces } = await useCollections();
  const space = await spaces.findOne({ _id: typeof spaceId === 'string' ? toObjectId(spaceId) : spaceId });
  if (!space || (space.deleted && !options.includeDeleted)) {
    throw createError({ statusCode: 404, statusMessage: 'Space not found' });
  }
  return space;
}

/**
 * Loads a space and makes sure the current user has at least the given access to it.
 * Answers with 404 (instead of 403) when the space is invisible to the user, so the
 * existence of private spaces does not leak.
 */
export async function requireSpaceAccess(
  event: H3Event,
  spaceId: string | ObjectId | undefined,
  minimum: Exclude<SpaceAccess, 'none'>,
  options: { includeDeleted?: boolean } = {},
): Promise<{ user: CurrentUser | undefined; space: DbSpace; access: SpaceAccess }> {
  const user = await getUser(event);
  const space = await loadSpace(spaceId, options);
  const access = getSpaceAccess(space, user);
  if (access === 'none') {
    throw createError({ statusCode: 404, statusMessage: 'Space not found' });
  }
  if (!hasAccess(access, minimum)) {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  return { user, space, access };
}

export async function requireSpaceAdmin(event: H3Event, spaceId: string | ObjectId | undefined): Promise<{ user: CurrentUser; space: DbSpace }> {
  const { user, space } = await requireSpaceAccess(event, spaceId, 'admin');
  return { user: user as CurrentUser, space };
}

/** a cache busting token for the image url, so a new image is shown immediately */
function imageVersion(imageKey: string): string {
  let hash = 0;
  for (let i = 0; i < imageKey.length; i++) {
    hash = (hash * 31 + imageKey.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function getImageUrl(space: Pick<DbSpace, '_id' | 'imageKey'>): string | undefined {
  if (!space.imageKey) {
    return undefined;
  }
  return `/api/spaces/${space._id.toString()}/image?v=${imageVersion(space.imageKey)}`;
}

/**
 * The json representation of a space for the given user. Admins see everything,
 * everyone else only the public subset (no members, no e-mail, no subscription).
 */
export function serializeSpace(space: DbSpace, user: CurrentUser | undefined, access: SpaceAccess): Space | PublicSpace {
  const base: PublicSpace = {
    _id: space._id.toString(),
    name: space.name,
    floorPlan: space.floorPlan ?? [],
    description: space.description,
    address: space.address,
    plan: space.plan ?? 'free',
    activeUntil: space.activeUntil?.toISOString(),
    currentPeriodEnd: space.currentPeriodEnd?.toISOString(),
    scheduledPlan: space.scheduledPlan,
    imageKey: space.imageKey,
    imageUrl: getImageUrl(space),
    coordinates: space.coordinates,
    importId: space.importId,
    phone: space.phone,
    website: space.website,
    bookingsAndRequests: space.bookingsAndRequests ?? 'bookings',
    role: getSpaceRole(space, user),
  };

  if (access !== 'admin') {
    return base;
  }

  return {
    ...base,
    members: space.members ?? [],
    email: space.email,
    subscription: space.subscription,
    isPublic: space.isPublic,
  };
}

/** adds name and e-mail of the users to the members of the given spaces */
export async function populateMembers(spaces: DbSpace[]): Promise<void> {
  const userIds = new Set<string>();
  for (const space of spaces) {
    for (const member of space.members ?? []) {
      if (isValidId(member.userId)) {
        userIds.add(member.userId);
      }
    }
  }
  if (userIds.size === 0) {
    return;
  }
  const { users } = await useCollections();
  const docs = await users.find({ _id: { $in: [...userIds].map(id => toObjectId(id)) } }).toArray();
  const byId = new Map(docs.map(doc => [doc._id.toString(), doc]));
  for (const space of spaces) {
    for (const member of space.members ?? []) {
      const user = byId.get(member.userId);
      member.name = user?.name;
      member.email = user?.email;
    }
  }
}
