import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  plan: 'free';
};

export const v020_resetPlansToFree: Migration = {
  id: 'reset-plans-to-free',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').updateMany({}, { $set: { plan: 'free' } });
  },
  async down() {
    // no down migration
  },
};
