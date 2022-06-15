import { Migration, MongoMigrationStore, up } from '@geprog/node-migrate-ts';
import { Db, MongoClient } from 'mongodb';

import { getConnectionUri } from '~/database';
import { addExistingUsersToSpace } from '~/migrations/addExistingUsersToSpace';
import { addSpaceReference } from '~/migrations/addSpaceReference';
import { customizeWaterkantSpace } from '~/migrations/customizeWaterkantSpace';
import { emailsToLowerCase } from '~/migrations/emailsToLowerCase';
import { refactorFloorPlan } from '~/migrations/refactorFloorPlan';
import { scaleFloorPlans } from '~/migrations/scaleFloorPlans';
import { scaleMapObjects } from '~/migrations/scaleMapObjects';
import { seed } from '~/migrations/seed';
import { setExplicitSpaceId } from '~/migrations/setExplicitSpaceId';
import { setGeprogSpacePlanSponsored } from '~/migrations/setGeprogSpacePlanSponsored';
import { setSpaceName } from '~/migrations/setSpaceName';

// migrations are applied in the order defined here
const migrations: Migration[] = [
  seed,
  setExplicitSpaceId,
  addSpaceReference,
  refactorFloorPlan,
  addExistingUsersToSpace,
  setSpaceName,
  emailsToLowerCase,
  setGeprogSpacePlanSponsored,
  scaleMapObjects,
  scaleFloorPlans,
  customizeWaterkantSpace,
];

const migrationStore = new MongoMigrationStore();

declare module '@geprog/node-migrate-ts' {
  interface MigrationContext {
    db: Db;
  }
}

export default async (): Promise<void> => {
  const client = await MongoClient.connect(getConnectionUri());
  const db = client.db();

  migrationStore.init({
    db,
    migrationsCollection: 'migrations',
  });

  await up({ migrations, migrationStore, context: { db } });

  await client.close();
};
