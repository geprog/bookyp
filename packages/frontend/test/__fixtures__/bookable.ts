import { Model } from '@bookyp/core';

export const sampleBookable: Model.Bookable = {
  _id: '123',
  name: 'Couch',
  description: 'Super long description',
};

export const sampleAdditionalBookable: Model.Bookable = {
  _id: '456',
  name: 'Table',
  description: 'Funny bunny description',
};

export const sampleBookables: Model.Bookable[] = [sampleBookable, sampleAdditionalBookable];
