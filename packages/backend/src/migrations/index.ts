import { Migration, MongoMigrationStore, up } from '@geprog/node-migrate-ts';
import { Db, MongoClient } from 'mongodb';

import { getConnectionUri } from '~/database';
import { v001_seed } from '~/migrations/v001_seed';
import { v002_setExplicitSpaceId } from '~/migrations/v002_setExplicitSpaceId';
import { v003_addSpaceReference } from '~/migrations/v003_addSpaceReference';
import { v004_refactorFloorPlan } from '~/migrations/v004_refactorFloorPlan';
import { v005_addExistingUsersToSpace } from '~/migrations/v005_addExistingUsersToSpace';
import { v006_setSpaceName } from '~/migrations/v006_setSpaceName';
import { v007_emailsToLowerCase } from '~/migrations/v007_emailsToLowerCase';
import { v008_setGeprogSpacePlanSponsored } from '~/migrations/v008_setGeprogSpacePlanSponsored';
import { v009_scaleMapObjects } from '~/migrations/v009_scaleMapObjects';
import { v010_scaleFloorPlans } from '~/migrations/v010_scaleFloorPlans';
import { v011_customizeWaterkantSpace } from '~/migrations/v011_customizeWaterkantSpace';
import { v012_customizeDECKMueritzSpace } from '~/migrations/v012_customizeDECKMueritzSpace';
import { v013_kitzSilentSpace } from '~/migrations/v013_kitzSilentSpace';
import { v014_geprogMeetingRoom } from '~/migrations/v014_geprogMeetingRoom';
import { v015_updateSponsoredSpaces } from '~/migrations/v015_updateSponsoredSpaces';
import { v016_refactorMapObjectLink } from '~/migrations/v016_refactorMapObjectLink';
import { v017_kitzAndGeprogEnterprise } from '~/migrations/v017_kitzAndGeprogEnterprise';
import { v018_deleteImportedSpaces } from '~/migrations/v018_deleteImportedSpaces';

// migrations are applied in the order defined here
const migrations: Migration[] = [
  v001_seed,
  v002_setExplicitSpaceId,
  v003_addSpaceReference,
  v004_refactorFloorPlan,
  v005_addExistingUsersToSpace,
  v006_setSpaceName,
  v007_emailsToLowerCase,
  v008_setGeprogSpacePlanSponsored,
  v009_scaleMapObjects,
  v010_scaleFloorPlans,
  v011_customizeWaterkantSpace,
  v012_customizeDECKMueritzSpace,
  v013_kitzSilentSpace,
  v014_geprogMeetingRoom,
  v015_updateSponsoredSpaces,
  v016_refactorMapObjectLink,
  v017_kitzAndGeprogEnterprise,
  v018_deleteImportedSpaces,
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
