/** readiness / liveness probe: answers once the database is connected and migrated */
export default defineEventHandler(async () => {
  const db = await useDatabase();
  await db.command({ ping: 1 });
  return { ok: true };
});
