import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

import { newFloorPlan } from './data/deckMueritzFloorPlan';

type Space = {
  _id: ObjectId;
  plan: undefined | 'public';
  floorPlan: string[];
};

const deckMueritzSpaceId = new ObjectId('631124385a99c3845e4160b4');

export const v012_customizeDECKMueritzSpace: Migration = {
  id: 'v012-customize-deck-mueritz-space',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: deckMueritzSpaceId }, { $set: { plan: 'public', floorPlan: newFloorPlan } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: deckMueritzSpaceId }, { $unset: { plan: '' }, $set: { floorPlan: [] } });
  },
};
