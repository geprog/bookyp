import { Migration } from '@geprog/node-migrate-ts';

export const v021_addRejectedByToInvitations: Migration = {
  id: 'add-rejected-by-to-invitations',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection('invitations').updateMany({}, { $set: { rejectedBy: [] } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection('invitations').updateMany({}, { $unset: { rejectedBy: [] } });
  },
};
