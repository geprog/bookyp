import type { H3Event, SessionConfig } from 'h3';
import type { User } from '#shared/types/models';
import type { DbUser } from './dbTypes';
import { getSession, updateSession } from 'h3';

export type CurrentUser = User & { isSuperAdmin: boolean };

function getSuperAdminEmails(): Set<string> {
  const { superAdminEmails } = useRuntimeConfig();
  return new Set(
    String(superAdminEmails)
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function toCurrentUser(user: DbUser): CurrentUser {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    starredSpaces: user.starredSpaces ?? [],
    isSuperAdmin: getSuperAdminEmails().has(user.email.toLowerCase()),
  };
}

/**
 * The current user or `undefined` for anonymous requests.
 * The user is always loaded fresh from the database so changes (e.g. starred spaces) are reflected immediately.
 */
export async function getUser(event: H3Event): Promise<CurrentUser | undefined> {
  const session = await getUserSession(event);
  if (!session.user?._id || !isValidId(session.user._id)) {
    return undefined;
  }
  const { users } = await useCollections();
  const user = await users.findOne({ _id: toObjectId(session.user._id) });
  if (!user) {
    await clearUserSession(event);
    return undefined;
  }
  return toCurrentUser(user);
}

/**
 * Re-issues the session cookie, so the session expires `maxAge` after the last visit instead of
 * after the login (v1 issued a new JWT on every navigation). nuxt-auth-utils keeps the creation
 * time of the session, which is what the expiry of the cookie is computed from.
 */
export async function renewUserSession(event: H3Event): Promise<void> {
  await getUserSession(event);
  const config = useRuntimeConfig(event).session as SessionConfig;
  const session = await getSession(event, config);
  session.createdAt = Date.now();
  await updateSession(event, config);
}

/** The current user, answering with 401 for anonymous requests. */
export async function requireUser(event: H3Event): Promise<CurrentUser> {
  const user = await getUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  return user;
}

export async function requireSuperAdmin(event: H3Event): Promise<CurrentUser> {
  const user = await requireUser(event);
  if (!user.isSuperAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  return user;
}
