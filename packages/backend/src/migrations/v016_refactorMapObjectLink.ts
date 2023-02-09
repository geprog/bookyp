import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type MapObject = {
  _id: ObjectId;
  link?: { type: 'url'; url: string } | { type: 'bookable'; bookable: string };
};

type OldMapObject = {
  _id: ObjectId;
  bookable?: string;
};

export const v016_refactorMapObjectLink: Migration = {
  id: 'v016-refactor-map-object-link',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    const mapObjectsCursor = db.collection<OldMapObject>('mapObjects'.toLowerCase()).find();
    while (await mapObjectsCursor.hasNext()) {
      const mapObject = await mapObjectsCursor.next();
      if (!mapObject || !mapObject.bookable) {
        continue;
      }

      await db.collection<MapObject>('mapObjects'.toLowerCase()).updateOne(
        { _id: mapObject._id },
        {
          $set: {
            link: { type: 'bookable', bookable: mapObject.bookable },
          },
          $unset: {
            bookable: '',
          },
        },
      );
    }
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    const mapObjectsCursor = db.collection<MapObject>('mapObjects'.toLowerCase()).find();
    while (await mapObjectsCursor.hasNext()) {
      const mapObject = await mapObjectsCursor.next();
      if (!mapObject || !mapObject.link || mapObject.link.type !== 'bookable') {
        continue;
      }

      await db.collection<OldMapObject>('mapObjects'.toLowerCase()).updateOne(
        { _id: mapObject._id },
        {
          $set: {
            bookable: mapObject.link.bookable,
          },
          $unset: {
            link: '',
          },
        },
      );
    }
  },
};
