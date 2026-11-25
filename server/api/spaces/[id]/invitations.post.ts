import type { DbInvitation } from '../../../utils/dbTypes';
import { MongoServerError, ObjectId } from 'mongodb';
import { z } from 'zod';

const bodySchema = z.object({
  /** an e-mail address or a domain like `@example.com` to invite everyone with that domain */
  email: z.union([emailSchema, z.string().trim().toLowerCase().regex(/^@[^\s@][^\s.@]*\.[^\s@]+$/, 'Invalid domain')]),
  role: z.enum(['admin', 'user']),
});

/** Invites a user (or a whole e-mail domain) to the space. */
export default defineEventHandler(async (event) => {
  const { user, space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const body = await readBody$(event, bodySchema);
  const { invitations, users } = await useCollections();

  await assertCanAddMember(space);
  await assertCanSendInvitationMail(space);

  const invitedUser = await users.findOne({ email: body.email });
  if (invitedUser && space.members.some(member => member.userId === invitedUser._id.toString())) {
    apiError(409, 'already_in_space', 'User already in space');
  }

  const invitation: DbInvitation = { _id: new ObjectId(), ...body, spaceId: space._id.toString(), rejectedBy: [] };
  try {
    await invitations.insertOne(invitation);
  }
  catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      apiError(409, 'already_invited', 'E-mail address is already invited');
    }
    throw error;
  }

  await recordInvitationMail(space);
  void sendSpaceInvitationMail(publicAppUrl(event), space, body.email, user).catch(error => console.error('🔥 Could not send invitation mail', error));

  setResponseStatus(event, 201);
  const [serialized] = await serializeInvitations([invitation]);
  return serialized;
});
