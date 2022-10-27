import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  plan: undefined | 'sponsored';
  floorPlan: string[];
};

const geprogMeetingRoomSpaceId = new ObjectId('635af2cd4ca1b5b8c0791d04');

export const v014_geprogMeetingRoom: Migration = {
  id: 'v014-geprog-meeting-room',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').updateOne({ _id: geprogMeetingRoomSpaceId }, { $set: { plan: 'sponsored' } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db.collection<Space>('spaces').updateOne({ _id: geprogMeetingRoomSpaceId }, { $unset: { plan: '' } });
  },
};
