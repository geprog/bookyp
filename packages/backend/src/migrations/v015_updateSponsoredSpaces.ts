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

const deckMueritzSpaceId = new ObjectId('631124385a99c3845e4160b4');
const waterkantSpaceId = new ObjectId('62a2f978e81ee2740e697644');
const geprogSpaceId = new ObjectId('626999802f7088caaa96206e');
const geprogMeetingRoomSpaceId = new ObjectId('635af2cd4ca1b5b8c0791d04');

export const v015_updateSponsoredSpaces: Migration = {
  id: 'v015-update-sponsored-spaces',
  async up(context) {
    if (!context || !context.db) {
      throw new Error('Please pass a context with a db object');
    }
    const { db } = context;
    const activeUntil = new Date('2023-12-31T12:02:00.000Z');
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: deckMueritzSpaceId }, { $set: { plan: 'public', activeUntil } });
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: waterkantSpaceId }, { $set: { plan: 'public', activeUntil } });
    await db
      .collection<Space>('spaces')
      .updateOne({ _id: geprogSpaceId }, { $set: { plan: 'enterprise', activeUntil } });
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
      .updateOne({ _id: deckMueritzSpaceId }, { $unset: { activeUntil: '' }, $set: { plan: 'sponsored' } });
    await db
      .collection<OldSpace>('spaces')
      .updateOne({ _id: waterkantSpaceId }, { $unset: { activeUntil: '' }, $set: { plan: 'sponsored' } });
    await db
      .collection<OldSpace>('spaces')
      .updateOne({ _id: geprogSpaceId }, { $unset: { activeUntil: '' }, $set: { plan: 'sponsored' } });
    await db
      .collection<OldSpace>('spaces')
      .updateOne({ _id: geprogMeetingRoomSpaceId }, { $unset: { activeUntil: '' }, $set: { plan: 'sponsored' } });
  },
};
