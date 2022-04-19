import { Model } from '~/index';

import { sampleUser } from './User';

export const sampleSpace = new Model.Space({
  _id: '623cfce8ce20e69a44b67eaa',
  floorPlan: ['M1 1 L1 255', 'M0 255 L30 255', 'M30 255 L30 324', 'M30 324 L287 324', 'M287 324 L287 1', 'M287 1 L1 1'],
  members: [
    {
      role: 'admin',
      userId: sampleUser._id,
    },
  ],
  name: 'New Space',
});

export const sampleSpaces = [sampleSpace];
