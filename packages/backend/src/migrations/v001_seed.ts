import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId, WithId } from 'mongodb';

type Space = {
  floorPlan: string[];
};

type Bookable = {
  name: string;
  description: string;
};

type MapObject = {
  xPos: number;
  yPos: number;
  rotation: number;
  paths: string[];
  type: 'table';
  bookable?: ObjectId;
};

export const v001_seed: Migration = {
  id: 'seed-038e215e-e648-11eb-ac5b-5b98cceacb59',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    const space = await db.collection<Space>('spaces').findOne({});
    if (space === null) {
      await db.collection<Space>('spaces').insertOne({
        floorPlan: [
          'M288 325H30.2315V226.738H1V1H288V325Z',
          'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
        ],
      });
    }

    const bookable = await db.collection<Bookable>('bookables').findOne({});
    if (bookable === null) {
      await db.collection<Bookable>('bookables').insertMany([
        {
          name: 'Desk 1',
          description: 'chef desk',
        },
        {
          name: 'Desk 2',
          description: 'pencil desk',
        },
      ]);
    }

    const mapObject = await db.collection<MapObject>('mapObjects'.toLowerCase()).findOne({});
    if (mapObject === null) {
      await db.collection<MapObject>('mapObjects'.toLowerCase()).insertOne({
        xPos: 70,
        yPos: 0,
        rotation: 0,
        paths: [
          'M5.60744 79.7345C3.25936 79.7345 1.35559 77.8319 1.35559 75.4853V5.90494C1.35559 3.55833 3.25936 1.65576 5.60744 1.65576H39.0908C41.4389 1.65576 43.3426 3.55833 43.3426 5.90494V75.4853C43.3426 77.8319 41.4389 79.7345 39.0908 79.7345H5.60744Z',
          'M38.0278 6.96729H1.35559V74.423H38.0278V6.96729Z',
          'M38.0279 6.96729H29.5242V40.4296H38.0279V6.96729Z',
          'M38.0279 40.4296H29.5242V74.423H38.0279V40.4296Z',
        ],
        type: 'table',
      });
      const insertedBookable = await db.collection<WithId<Bookable>>('bookables').findOne({});
      if (insertedBookable !== null) {
        await db.collection<MapObject>('mapObjects'.toLowerCase()).insertOne({
          xPos: 30,
          yPos: 90,
          rotation: 0,
          paths: [
            'M32 0h80v140h-80v-140z', // for the table
            'M0 42h32v56h-32v-56z', // for the chair
          ],
          type: 'table',
          bookable: insertedBookable._id,
        });
      }
    }
  },
  async down() {
    // not implemented since deleting entities without knowing IDs could be destructive
  },
};
