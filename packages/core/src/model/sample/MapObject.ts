import { Model } from '~/index';

import { sampleBookable } from './Bookable';
import { sampleSpace } from './Space';

export const sampleMapObject = new Model.MapObject({
  _id: '623cfce8ce20e69a44b67ea0',
  xPos: 70,
  yPos: 0,
  rotation: 0,
  paths: [
    'M5.60744 79.7345C3.25936 79.7345 1.35559 77.8319 1.35559 75.4853V5.90494C1.35559 3.55833 3.25936 1.65576 5.60744 1.65576H39.0908C41.4389 1.65576 43.3426 3.55833 43.3426 5.90494V75.4853C43.3426 77.8319 41.4389 79.7345 39.0908 79.7345H5.60744Z',
    'M38.0278 6.96729H1.35559V74.423H38.0278V6.96729Z',
    'M38.0279 6.96729H29.5242V40.4296H38.0279V6.96729Z',
    'M38.0279 40.4296H29.5242V74.423H38.0279V40.4296Z',
  ],
  type: 'table',
  space: sampleSpace._id,
});

export const sampleMapObjectSecond = new Model.MapObject({
  _id: '623cfce242665e3555851c2f',
  xPos: 30,
  yPos: 90,
  rotation: 0,
  paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
  type: 'table',
  bookable: sampleBookable._id,
  space: sampleSpace._id,
});

export const sampleMapObjects = [sampleMapObject, sampleMapObjectSecond];
