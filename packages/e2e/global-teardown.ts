import { MongoClient } from 'mongodb';

async function globalTeardown(): Promise<void> {
  const client = await MongoClient.connect(process.env.BACKEND_DB_URI);
  const db = client.db();
  await db.dropDatabase();
}

export default globalTeardown;
