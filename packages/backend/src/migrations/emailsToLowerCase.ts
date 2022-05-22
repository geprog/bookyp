import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type User = {
  _id: ObjectId;
  email: string;
};

type Invitation = {
  _id: ObjectId;
  email: string;
};

export const emailsToLowerCase: Migration = {
  id: 'emails-to-lowercase',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    const cursorUsers = db.collection<User>('users').find();
    while (await cursorUsers.hasNext()) {
      const user = await cursorUsers.next();
      if (!user) {
        continue;
      }

      await db.collection<User>('user').updateOne(
        { _id: user._id },
        {
          $set: {
            email: user.email.toLowerCase(),
          },
        },
      );
    }

    const cursorInvitations = db.collection<Invitation>('invitations').find();
    while (await cursorInvitations.hasNext()) {
      const invitation = await cursorInvitations.next();
      if (!invitation) {
        continue;
      }

      await db.collection<Invitation>('invitations').updateOne(
        { _id: invitation._id },
        {
          $set: {
            email: invitation.email.toLowerCase(),
          },
        },
      );
    }
  },
  async down() {
    // can't revert
  },
};
