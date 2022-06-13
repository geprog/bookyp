import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';
import svgpath from 'svgpath';

type Space = {
  _id: ObjectId;
  floorPlan: string[];
};

const scaleX = 80 / (56.9259 - 17.0648); // scaleX = desiredTableWidth / currentTableWidth (see `scaleMapObjects.ts#oldMapObjectPaths` for the current table height)
const scaleY = 140 / (83.4525 - 1.12463); // scaleY = desiredTableHeight / currentTableHeight (see `scaleMapObjects.ts#oldMapObjectPaths` for the current table height)

export const scaleFloorPlans: Migration = {
  id: 'scale-floor-plans',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    const spacesCursor = db.collection<Space>('spaces').find();
    while (await spacesCursor.hasNext()) {
      const space = await spacesCursor.next();
      if (!space) {
        continue;
      }

      const floorPlan = space.floorPlan.map((path) => svgpath(path).scale(scaleX, scaleY).toString());
      await db.collection<Space>('spaces').updateOne(
        { _id: space._id },
        {
          $set: {
            floorPlan,
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

    const spacesCursor = db.collection<Space>('spaces').find();
    while (await spacesCursor.hasNext()) {
      const space = await spacesCursor.next();
      if (!space) {
        continue;
      }

      const floorPlan = space.floorPlan.map((path) =>
        svgpath(path)
          .scale(1 / scaleX, 1 / scaleY)
          .toString(),
      );
      await db.collection<Space>('spaces').updateOne(
        { _id: space._id },
        {
          $set: {
            floorPlan,
          },
        },
      );
    }
  },
};
