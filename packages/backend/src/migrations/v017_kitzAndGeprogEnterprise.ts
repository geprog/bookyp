import { Migration } from '@geprog/node-migrate-ts';
import { ObjectId } from 'mongodb';

type Space = {
  _id: ObjectId;
  plan: undefined | 'free' | 'enterprise' | 'public';
  activeUntil?: Date;
};

type OldSpace = {
  _id: ObjectId;
  plan: undefined | 'free' | 'public' | 'sponsored';
  activeUntil?: Date;
};

const kitzSilentSpaceId = new ObjectId('633d57d658abb672997b2c19');
const geprogMeetingRoomSpaceId = new ObjectId('635af2cd4ca1b5b8c0791d04');

export const v017_kitzAndGeprogEnterprise: Migration = {
  id: 'v017_kitzAndGeprogEnterprise',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    const activeUntil = new Date('2023-12-31T12:02:00.000Z');
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: kitzSilentSpaceId }, { $set: { plan: 'enterprise', activeUntil } });
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: geprogMeetingRoomSpaceId }, { $set: { plan: 'enterprise', activeUntil } });
  },
  async down(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    await db
      .collection<OldSpace>('spaces')
      .updateOne({ _id: kitzSilentSpaceId }, { $unset: { activeUntil: '' }, $set: { plan: 'sponsored' } });
    await db
      .collection<OldSpace>('spaces')
      .updateOne({ _id: geprogMeetingRoomSpaceId }, { $unset: { activeUntil: '' }, $set: { plan: 'sponsored' } });
  },
};
