import process from 'node:process';
import { MongoClient, ObjectId } from 'mongodb';
import { sampleData } from '../scripts/sampleData';
import { credentials } from './credentials';

/** resets the database to the sample data (same as `pnpm seed`) */
export async function seed(): Promise<void> {
  const uri = process.env.NUXT_MONGODB_URI;
  if (!uri) {
    throw new Error('NUXT_MONGODB_URI is not set');
  }
  const client = await MongoClient.connect(uri);
  const db = client.db();
  await db.dropDatabase();

  const data = sampleData({ testUserEmail: credentials.username });
  const withObjectId = <T extends { _id: string }>(doc: T) => ({ ...doc, _id: new ObjectId(doc._id) });

  await db.collection('users').insertMany(data.users.map(withObjectId));
  await db.collection('spaces').insertMany(data.spaces.map(withObjectId));
  await db.collection('bookables').insertMany(data.bookables.map(withObjectId));
  await db.collection('mapobjects').insertMany(data.mapObjects.map(withObjectId));
  await db.collection('bookings').insertMany(data.bookings.map(withObjectId));

  await client.close();
}
