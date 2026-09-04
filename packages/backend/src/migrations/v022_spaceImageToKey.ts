import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  image?: string;
  imageKey?: string;
};

/**
 * Space images used to be stored as a full public url pointing at the s3www based cdn.
 * Only the object key is persisted now, the download url is signed on every read.
 *
 * The cdn host differs per environment (cdn.bookyp.de, <env>.cdn.bookyp.de, localhost:9080),
 * so the key is taken from the url path instead of matching a known prefix.
 */
export const v022_spaceImageToKey: Migration = {
  id: 'space-image-to-key',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    const spaces = db.collection<Space>('spaces');

    const spacesWithImage = await spaces.find({ image: { $exists: true, $ne: '' } }).toArray();

    for await (const space of spacesWithImage) {
      const { image } = space;
      if (!image) {
        continue;
      }

      let key: string | undefined;
      try {
        key = new URL(image).pathname.replace(/^\//, '');
      } catch {
        key = undefined;
      }

      // uploads are always stored below the id of their space, anything else is
      // not a file we uploaded and must not be turned into an object key
      if (!key || key.split('/')[0] !== space._id.toString()) {
        // eslint-disable-next-line no-console
        console.warn(`Skipping space ${space._id.toString()}: unexpected image url "${image}"`);
        continue;
      }

      await spaces.updateOne({ _id: space._id }, { $set: { imageKey: key }, $unset: { image: '' } });
    }
  },
  async down() {
    // no down migration, the cdn url prefix is not known anymore
  },
};
