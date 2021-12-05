import type { Model } from '@bookyp/core';
import { MongoClient, ObjectId } from 'mongodb';

type WithObjectId<T> = Omit<T, '_id'> & { _id: ObjectId };

export async function seed(): Promise<void> {
  if (!process.env.BACKEND_DB_URI) {
    throw new Error('BACKEND_DB_URI is not set');
  }
  const client = await MongoClient.connect(process.env.BACKEND_DB_URI);
  const db = client.db();
  await db.dropDatabase();

  if (!process.env.E2E_AUTH_USERNAME) {
    throw new Error('E2E_AUTH_USERNAME is not set');
  }
  const USER_ID = '61a9f0fcce48045610c65a6f';
  await db.collection<WithObjectId<Model.User>>('users').insertOne({
    _id: new ObjectId(USER_ID),
    email: process.env.E2E_AUTH_USERNAME || '',
  });

  const SPACE_ID = '60f53bede6f8313dff7f99e0';
  await db.collection<WithObjectId<Model.Space>>('spaces').insertOne({
    _id: new ObjectId(SPACE_ID),
    floorPlan: [
      'M1 1 L1 255',
      'M0 255 L30 255',
      'M30 255 L30 324',
      'M30 324 L287 324',
      'M287 324 L287 1',
      'M287 1 L1 1',
    ],
    members: [
      {
        role: 'admin',
        userId: USER_ID,
      },
    ],
  });

  const BOOKABLE_ID = '60f53bede6f8313dff7f99e1';
  await db.collection<WithObjectId<Model.Bookable>>('bookables').insertMany([
    {
      _id: new ObjectId(BOOKABLE_ID),
      name: 'Desk 1',
      space: SPACE_ID,
      description: 'chef desk',
    },
    {
      _id: new ObjectId('60f53bede6f8313dff7f99e2'),
      name: 'Desk 2',
      space: SPACE_ID,
      description: 'pencil desk',
    },
  ]);

  // cspell:disable-next-line
  await db.collection<WithObjectId<Model.MapObject>>('mapobjects').insertMany([
    {
      _id: new ObjectId('60f53bede6f8313dff7f99e3'),
      xPos: 70,
      yPos: 0,
      rotation: 0,
      paths: [
        'M5.60744 79.7345C3.25936 79.7345 1.35559 77.8319 1.35559 75.4853V5.90494C1.35559 3.55833 3.25936 1.65576 5.60744 1.65576H39.0908C41.4389 1.65576 43.3426 3.55833 43.3426 5.90494V75.4853C43.3426 77.8319 41.4389 79.7345 39.0908 79.7345H5.60744Z',
        'M38.0278 6.96729H1.35559V74.423H38.0278V6.96729Z',
        'M38.0279 6.96729H29.5242V40.4296H38.0279V6.96729Z',
        'M38.0279 40.4296H29.5242V74.423H38.0279V40.4296Z',
      ],
      // TODO: use actual enum value
      type: 'table' as Model.MapObjectTypes.table,
      space: SPACE_ID,
    },
    {
      _id: new ObjectId('60f53bede6f8313dff7f99e4'),
      xPos: 30,
      yPos: 90,
      rotation: 0,
      paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
      // TODO: use actual enum value
      type: 'table' as Model.MapObjectTypes.table,
      bookable: BOOKABLE_ID,
      space: SPACE_ID,
    },
  ]);

  await client.close();
}
