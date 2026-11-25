import { runMigrations } from '../db/migrations';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('⚡ Connecting to the database ...');
  await initDatabase(runMigrations);
  console.log('🚀 Database ready');

  nitroApp.hooks.hook('close', async () => {
    await closeDatabase();
  });
});
