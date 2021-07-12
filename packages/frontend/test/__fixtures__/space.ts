import { sampleFloorPlan } from './floorPlan';

export const sampleSpace = { _id: 'first', floorPlan: sampleFloorPlan };

export const additionalSampleSpace = {
  _id: 'second',
  floorPlan: sampleFloorPlan,
};

export const sampleSpaces = [sampleSpace, additionalSampleSpace];
