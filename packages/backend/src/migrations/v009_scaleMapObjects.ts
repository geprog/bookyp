import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type MapObject = {
  _id: ObjectId;
  paths: string[];
  xPos: number;
  yPos: number;
};

const newMapObjectPaths = [
  'M32 0h80v140h-80v-140z', // for the table
  'M0 42h32v56h-32v-56z', // for the chair
];

const oldMapObjectPaths = [
  'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', // for the table
  'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z', // for the chair
];

const scaleX = 80 / (56.9259 - 17.0648); // scaleX = desiredTableWidth / currentTableWidth (see `oldMapObjectPaths` for the current table width)
const scaleY = 140 / (83.4525 - 1.12463); // scaleY = desiredTableHeight / currentTableHeight (see `oldMapObjectPaths` for the current table height)

export const v009_scaleMapObjects: Migration = {
  id: 'scale-map-objects',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;

    const mapObjectsCursor = db.collection<MapObject>('mapObjects'.toLowerCase()).find();
    while (await mapObjectsCursor.hasNext()) {
      const mapObject = await mapObjectsCursor.next();
      if (!mapObject) {
        continue;
      }

      await db.collection<MapObject>('mapObjects'.toLowerCase()).updateOne(
        { _id: mapObject._id },
        {
          $set: {
            paths: newMapObjectPaths,
            xPos: mapObject.xPos * scaleX,
            yPos: mapObject.yPos * scaleY,
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
      if (!mapObject) {
        continue;
      }

      await db.collection<MapObject>('mapObjects'.toLowerCase()).updateOne(
        { _id: mapObject._id },
        {
          $set: {
            paths: oldMapObjectPaths,
            xPos: mapObject.xPos / scaleX,
            yPos: mapObject.yPos / scaleY,
          },
        },
      );
    }
  },
};
