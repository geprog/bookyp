import { Model, SampleModel } from '@bookyp/core';
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

  function convertId2ObjectId<T extends Model.AbstractEntity>(m: T): WithObjectId<T> {
    return {
      ...m,
      _id: new ObjectId(m._id),
    };
  }

  const sampleUsers = SampleModel.sampleUsers;

  // set email for first user to test with interesting data of authenticated test user
  sampleUsers[0] = { ...SampleModel.sampleUsers[0], email: process.env.E2E_AUTH_USERNAME };

  await db.collection('users').insertMany(sampleUsers.map(convertId2ObjectId));
  await db.collection('spaces').insertMany(SampleModel.sampleSpaces.map(convertId2ObjectId));
  await db.collection('bookables').insertMany(SampleModel.sampleBookables.map(convertId2ObjectId));
  // cspell:disable-next-line
  await db.collection('mapobjects').insertMany(SampleModel.sampleMapObjects.map(convertId2ObjectId));
  await db.collection('bookings').insertMany(SampleModel.sampleBookings.map(convertId2ObjectId));

  // TODO: workaround to not run the `add-existing-users-to-space` migration, remove this once the current migrations are removed
  interface MigrationModel {
    id?: string;
    migrationId: string;
    timestamp: number;
  }
  await db.collection<WithObjectId<MigrationModel>>('migrations').insertMany([
    {
      _id: new ObjectId('61e6be67c9a0309228824a68'),
      migrationId: 'seed-038e215e-e648-11eb-ac5b-5b98cceacb59',
      timestamp: 1642511975179,
    },
    { _id: new ObjectId('61e6be67c9a0309228824a69'), migrationId: 'set-explicit-space-id', timestamp: 1642511975212 },
    { _id: new ObjectId('61e6be67c9a0309228824a6a'), migrationId: 'add-space-reference', timestamp: 1642511975221 },
    {
      _id: new ObjectId('61e6be67c9a0309228824a6b'),
      migrationId: 'refactor-floor-plan-to-allow-wall-selection',
      timestamp: 1642511975226,
    },
    {
      _id: new ObjectId('61e6be67c9a0309228824a6c'),
      migrationId: 'add-existing-users-to-space',
      timestamp: 1642511975231,
    },
  ]);

  await client.close();
}
