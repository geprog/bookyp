import { Migration, MongoMigrationStore, up } from '@geprog/node-migrate-ts';
import { Db, MongoClient } from 'mongodb';

import { getConnectionUri } from '~/database';
import { seed } from '~/migrations/seed';
import { setExplicitSpaceId } from '~/migrations/setExplicitSpaceId';

// migrations are applied in the order defined here
const migrations: Migration[] = [seed, setExplicitSpaceId];

const migrationStore = new MongoMigrationStore();

declare module '@geprog/node-migrate-ts' {
  interface MigrationContext {
    db: Db;
  }
}

export default async (): Promise<void> => {
  const client = await MongoClient.connect(getConnectionUri(), { useUnifiedTopology: true });
  const db = client.db();

  migrationStore.init({
    db,
    migrationsCollection: 'migrations',
  });

  await up({ migrations, migrationStore, context: { db } });
};
