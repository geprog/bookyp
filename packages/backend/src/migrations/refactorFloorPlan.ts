import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  floorPlan: string[];
};

export const refactorFloorPlan: Migration = {
  id: 'refactor-floor-plan-to-allow-wall-selection',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    await db.collection<Space>('spaces').updateOne(
      { _id: new ObjectId('60f53bede6f8313dff7f99e0') },
      {
        $set: {
          floorPlan: [
            'M1 1 L1 255',
            'M0 255 L30 255',
            'M30 255 L30 324',
            'M30 324 L287 324',
            'M287 324 L287 1',
            'M287 1 L1 1',
          ],
        },
      },
    );
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').updateOne(
      { _id: new ObjectId('60f53bede6f8313dff7f99e0') },
      {
        $set: {
          floorPlan: [
            'M288 325H30.2315V226.738H1V1H288V325Z',
            'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
          ],
        },
      },
    );
  },
};
