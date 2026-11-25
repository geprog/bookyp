/**
 * Seeds the database with sample data for local development and the e2e tests.
 * Usage: `pnpm seed` (reads NUXT_MONGODB_URI from .env)
 */
import process from 'node:process';
import { config as dotenv } from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { sampleData } from './sampleData';

dotenv({ path: new URL('../.env', import.meta.url).pathname });

async function seed(): Promise<void> {
  const uri = process.env.NUXT_MONGODB_URI;
  if (!uri) {
    throw new Error('NUXT_MONGODB_URI is not set');
  }
  const testUserEmail = process.env.E2E_AUTH_USERNAME || 'alice@wonderland.org';

  const client = await MongoClient.connect(uri);
  const db = client.db();
  await db.dropDatabase();

  const data = sampleData({ testUserEmail });
  const withObjectId = <T extends { _id: string }>(doc: T) => ({ ...doc, _id: new ObjectId(doc._id) });

  await db.collection('users').insertMany(data.users.map(withObjectId));
  await db.collection('spaces').insertMany(data.spaces.map(withObjectId));
  await db.collection('bookables').insertMany(data.bookables.map(withObjectId));
  await db.collection('mapobjects').insertMany(data.mapObjects.map(withObjectId));
  await db.collection('bookings').insertMany(data.bookings.map(withObjectId));

  await client.close();
}

console.log('🌱 seeding database ...');
await seed();
console.log('🌱 seeding done');
