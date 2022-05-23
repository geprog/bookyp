import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  plan: undefined | 'sponsored';
};

export const setGeprogSpacePlanSponsored: Migration = {
  id: 'set-geprog-space-plan-sponsored',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: new ObjectId('626999802f7088caaa96206e') }, { $set: { plan: 'sponsored' } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: new ObjectId('626999802f7088caaa96206e') }, { $unset: { plan: '' } });
  },
};
