import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  floorPlan: string[];
};

export const setSpaceName: Migration = {
  id: 'set-Space-Name',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').updateMany({ name: undefined }, { $set: { name: 'New Space' } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').updateMany({}, { $unset: { name: '' } });
  },
};
