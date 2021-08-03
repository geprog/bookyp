import { Migration } from '@geprog/node-migrate-ts';

type ModelWithSpaceReference = {
  space: string;
};

const spaceId = '60f53bede6f8313dff7f99e0';

export const addSpaceReference: Migration = {
  id: 'add-space-reference',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    await db.collection<ModelWithSpaceReference>('bookables').updateMany(
      {},
      {
        $set: {
          space: spaceId,
        },
      },
    );

    await db.collection<ModelWithSpaceReference>('mapObjects'.toLowerCase()).updateMany(
      {},
      {
        $set: {
          space: spaceId,
        },
      },
    );

    await db.collection<ModelWithSpaceReference>('bookings').updateMany(
      {},
      {
        $set: {
          space: spaceId,
        },
      },
    );
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    await db.collection<ModelWithSpaceReference>('bookables').updateMany(
      {
        space: spaceId,
      },
      {
        $unset: { space: '' },
      },
    );

    await db.collection<ModelWithSpaceReference>('mapObjects'.toLowerCase()).updateMany(
      {
        space: spaceId,
      },
      {
        $unset: { space: '' },
      },
    );

    await db.collection<ModelWithSpaceReference>('bookings').updateMany(
      {
        space: spaceId,
      },
      {
        $unset: { space: '' },
      },
    );
  },
};
