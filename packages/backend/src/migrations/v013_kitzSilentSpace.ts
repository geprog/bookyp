import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

import { newFloorPlan } from './data/kitzSilentFloorPlan';

type Space = {
  _id: ObjectId;
  plan: undefined | 'sponsored';
  floorPlan: string[];
};

const kitzSilentSpaceId = new ObjectId('633d57d658abb672997b2c19');

export const v013_kitzSilentSpace: Migration = {
  id: 'v013-customize-kitz-silent-space',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: kitzSilentSpaceId }, { $set: { plan: 'sponsored', floorPlan: newFloorPlan } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: kitzSilentSpaceId }, { $unset: { plan: '' }, $set: { floorPlan: [] } });
  },
};
