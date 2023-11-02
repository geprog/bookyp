import { Model } from '@bookyp/core';

import { sampleFloorPlan } from './floorPlan';

export const sampleSpace: Model.Space = {
  _id: 'first',
  name: 'first sample space',
  floorPlan: sampleFloorPlan,
  members: [],
  plan: 'free',
  bookingsAndRequests: 'bookings',
};

export const additionalSampleSpace: Model.Space = {
  _id: 'second',
  name: 'second sample space',
  floorPlan: sampleFloorPlan,
  members: [],
  plan: 'free',
  bookingsAndRequests: 'bookings',
};

export const sampleSpaces = [sampleSpace, additionalSampleSpace];
