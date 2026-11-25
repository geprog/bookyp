import type { H3Event } from 'h3';
import type { Invitation } from '#shared/types/models';
import type { DbInvitation, DbSpace } from './dbTypes';
import type { CurrentUser } from './session';
import { ObjectId } from 'mongodb';

/** invitation mails a space may send per day, so the invitations can not be used to send spam */
export const invitationMailsPerDay = 50;
export const invitationMailWindowSeconds = 24 * 60 * 60;

/**
 * Answers with 429 when the space sent too many invitation mails in the last day. The sent mails are
 * kept apart from the invitations, so deleting an invitation and inviting again does not reset the count.
 */
export async function assertCanSendInvitationMail(space: DbSpace): Promise<void> {
  const { invitationMails } = await useCollections();
  const since = new Date(Date.now() - invitationMailWindowSeconds * 1000);
  const sent = await invitationMails.countDocuments({ spaceId: space._id.toString(), sentAt: { $gt: since } });
  if (sent >= invitationMailsPerDay) {
    apiError(429, 'invitations_limit_reached', 'Too many invitations, please try again tomorrow');
  }
}

export async function recordInvitationMail(space: DbSpace): Promise<void> {
  const { invitationMails } = await useCollections();
  await invitationMails.insertOne({ _id: new ObjectId(), spaceId: space._id.toString(), sentAt: new Date() });
}

export function emailDomain(email: string): string {
  return `@${email.split('@')[1] ?? ''}`;
}

export function isInvitee(invitation: Pick<DbInvitation, 'email'>, user: CurrentUser): boolean {
  return invitation.email === user.email || invitation.email === emailDomain(user.email);
}

/**
 * `invitee` is given when the invitations are serialized for an invitee (not an admin of the space),
 * they only learn whether they rejected the invitation themselves, not who else did.
 */
export async function serializeInvitations(invitations: DbInvitation[], invitee?: CurrentUser): Promise<Invitation[]> {
  const { spaces } = await useCollections();
  const spaceIds = [...new Set(invitations.map(invitation => invitation.spaceId))].filter(isValidId);
  const docs = spaceIds.length ? await spaces.find({ _id: { $in: spaceIds.map(id => toObjectId(id)) } }, { projection: { name: 1 } }).toArray() : [];
  const names = new Map(docs.map(doc => [doc._id.toString(), doc.name]));
  return invitations.map(invitation => ({
    ...serialize(invitation),
    rejectedBy: (invitation.rejectedBy ?? []).filter(userId => !invitee || userId === invitee._id),
    spaceName: names.get(invitation.spaceId) ?? '',
  }));
}

/** Loads an invitation the user is allowed to see: admins of the space and the invitee. */
export async function requireInvitation(event: H3Event, invitationId: string | undefined): Promise<{ invitation: DbInvitation; user: CurrentUser; isAdmin: boolean }> {
  const user = await requireUser(event);
  const { invitations } = await useCollections();
  const invitation = await invitations.findOne({ _id: toObjectId(invitationId) });
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' });
  }
  const space = await loadSpace(invitation.spaceId);
  const isAdmin = getSpaceAccess(space, user) === 'admin';
  if (!isAdmin && !isInvitee(invitation, user)) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' });
  }
  return { invitation, user, isAdmin };
}
