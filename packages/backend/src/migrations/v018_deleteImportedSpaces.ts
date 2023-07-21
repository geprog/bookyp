import { Migration } from '@geprog/node-migrate-ts';

type Space = {
  importId?: string;
};

export const v018_deleteImportedSpaces: Migration = {
  id: 'v018_deleteImportedSpaces',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').deleteMany({ importId: { $exists: true } });
  },
  async down() {
    // no down migration
  },
};
