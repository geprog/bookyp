import { Model } from '~/index';

import { sampleSpace } from './Space';

export const sampleBookable = new Model.Bookable({
  name: 'Desk 1',
  space: sampleSpace._id,
  description: 'chef desk',
});

export const sampleBookableSecond = new Model.Bookable({
  name: 'Desk 2',
  space: sampleSpace._id,
  description: 'pencil desk',
});

export const sampleBookableThird = new Model.Bookable({
  name: 'Desk 3',
  space: sampleSpace._id,
  description: 'Desk with big monitor',
});

export const sampleBookables = [sampleBookable, sampleBookableSecond];
