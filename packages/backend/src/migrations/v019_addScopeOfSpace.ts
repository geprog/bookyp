import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  plan: 'free' | 'enterprise' | 'public';
  isPublic: boolean;
};

export const v019_addScopeOfSpace: Migration = {
  id: 'add-scope-of-space',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<Space>('spaces')
      .updateMany({ plan: { $in: ['free', 'enterprise'] } }, { $set: { isPublic: false } });
    await db.collection<Space>('spaces').updateMany({ plan: 'public' }, { $set: { isPublic: true } });
  },
  async down() {
    // no down migration
  },
};
