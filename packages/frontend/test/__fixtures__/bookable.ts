import { Model } from '@bookyp/core';

import { sampleSpace } from './space';

export const sampleBookable: Model.Bookable = {
  _id: '123',
  name: 'Couch',
  description: 'Super long description',
  space: sampleSpace._id,
};

export const sampleAdditionalBookable: Model.Bookable = {
  _id: '456',
  name: 'Table',
  description: 'Funny bunny description',
  space: sampleSpace._id,
};

export const sampleBookables: Model.Bookable[] = [sampleBookable, sampleAdditionalBookable];
