import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type User = {
  _id: ObjectId;
};

type Member = {
  role: 'admin' | 'user';
  userId: string;
};

type Space = {
  members: Member[];
};

export const addExistingUsersToSpace: Migration = {
  id: 'add-existing-users-to-space',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    const users = await db.collection<User>('users').find({}).toArray();
    if (users.length > 0) {
      await db.collection<Space>('spaces').updateOne(
        {},
        {
          $set: {
            members: users.map((user) => ({ role: 'user', userId: user._id.toHexString() })),
          },
        },
      );
    }
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    await db.collection<Space>('spaces').updateOne(
      {},
      {
        $unset: {
          members: '',
        },
      },
    );
  },
};
