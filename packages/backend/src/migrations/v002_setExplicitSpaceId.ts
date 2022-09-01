import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  floorPlan: string[];
};

export const v002_setExplicitSpaceId: Migration = {
  id: 'set-explicit-space-id',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    const space = await db.collection<Space>('spaces').findOne({});
    if (space === null) {
      throw new Error('A space should exist');
    }
    await db.collection<Space>('spaces').deleteOne({ _id: space._id });
    await db.collection<Space>('spaces').insertOne({
      ...space,
      _id: new ObjectId('60f53bede6f8313dff7f99e0'),
    });
  },
  async down() {
    // not implemented since reverting to an unknown id is not possible
  },
};
