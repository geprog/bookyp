import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

import { newFloorPlan, oldFloorPlan } from './data/waterkantFloorPlan';

type Space = {
  _id: ObjectId;
  plan: undefined | 'public';
  floorPlan: string[];
};

export const v011_customizeWaterkantSpace: Migration = {
  id: 'customize-waterkant-space',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne(
        { _id: new ObjectId('62a2f978e81ee2740e697644') },
        { $set: { plan: 'public', floorPlan: newFloorPlan } },
      );
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne(
        { _id: new ObjectId('62a2f978e81ee2740e697644') },
        { $unset: { plan: '' }, $set: { floorPlan: oldFloorPlan } },
      );
  },
};
