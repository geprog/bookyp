import type { Db } from 'mongodb';
import { collections } from '../../utils/db';
import { v023_removeGringotts } from './v023_removeGringotts';

export interface Migration {
  id: string;
  up: (db: Db) => Promise<void>;
}

/**
 * Migrations are applied in the order defined here. The ids of the v1 migrations
 * are still stored in the `migrations` collection of existing databases, which is
 * harmless as they are not part of this list anymore.
 */
const migrations: Migration[] = [v023_removeGringotts];

export async function runMigrations(db: Db): Promise<void> {
  const { migrations: store } = collections(db);
  const applied = new Set((await store.find().toArray()).map(m => m.migrationId));
  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }
    console.log(`⏫ Applying migration ${migration.id}`);
    await migration.up(db);
    await store.insertOne({ migrationId: migration.id, timestamp: Date.now() } as never);
  }
}
