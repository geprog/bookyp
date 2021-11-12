import { Migration, MongoMigrationStore, up } from '@geprog/node-migrate-ts';
import { Db, MongoClient } from 'mongodb';

import { getConnectionUri } from '~/database';
import { addSpaceReference } from '~/migrations/addSpaceReference';
import { refactorFloorPlan } from '~/migrations/refactorFloorPlan';
import { seed } from '~/migrations/seed';
import { setExplicitSpaceId } from '~/migrations/setExplicitSpaceId';

// migrations are applied in the order defined here
const migrations: Migration[] = [seed, setExplicitSpaceId, addSpaceReference, refactorFloorPlan];

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

  await client.close();
};
