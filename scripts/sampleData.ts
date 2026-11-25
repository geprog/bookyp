/**
 * Sample data shared by the seed script and the e2e tests.
 * The ids are fixed so tests can rely on them.
 */

export const sampleUser = {
  _id: '623cfce8ce20e69a44b67e01',
  email: 'herbert@example.com',
  name: 'Herbert',
  starredSpaces: [] as string[],
};

export const sampleFloorPlan = ['M1 1 L1 255', 'M0 255 L30 255', 'M30 255 L30 324', 'M30 324 L287 324', 'M287 324 L287 1', 'M287 1 L1 1'];

export const sampleSpace = {
  _id: '623cfce8ce20e69a44b67eaa',
  floorPlan: sampleFloorPlan,
  members: [{ role: 'admin', userId: sampleUser._id }],
  name: 'New Space',
  plan: 'free',
  isPublic: false,
  bookingsAndRequests: 'bookings',
};

export const sampleSpaceWithUserRole = {
  _id: '623cfce8ce20e69a44b67eab',
  floorPlan: sampleFloorPlan,
  members: [{ role: 'user', userId: sampleUser._id }],
  name: 'New Space with user role',
  plan: 'free',
  isPublic: false,
  bookingsAndRequests: 'bookings',
};

export const sampleBookable = {
  _id: '623cfce8ce20e69a44b67eb1',
  name: 'Desk 1',
  space: sampleSpace._id,
  description: 'chef desk',
};

export const sampleBookableSecond = {
  _id: '623cfce8ce20e69a44b67eb2',
  name: 'Desk 2',
  space: sampleSpace._id,
  description: 'pencil desk',
};

/** not part of the seed, used by tests that create a bookable */
export const sampleBookableThird = {
  name: 'Desk 3',
  description: 'Desk with big monitor',
};

export const sampleMapObject = {
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
  type: 'couch',
  space: sampleSpace._id,
};

export const sampleMapObjectSecond = {
  _id: '623cfce242665e3555851c2f',
  xPos: 30,
  yPos: 90,
  rotation: 0,
  paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
  type: 'table',
  link: { type: 'bookable', bookable: sampleBookable._id },
  space: sampleSpace._id,
};

export const sampleBooking = {
  _id: '623cfce8ce20e69a44b67ec1',
  start: new Date('2022-03-24T04:08:00.000Z'),
  end: new Date('2022-03-24T21:08:43.922Z'),
  bookedBy: sampleUser._id,
  bookable: sampleBookable._id,
  description: 'I need this table for the whole day.',
  space: sampleSpace._id,
};

export function sampleData(options: { testUserEmail: string }) {
  return {
    users: [{ ...sampleUser, email: options.testUserEmail }],
    spaces: [sampleSpace, sampleSpaceWithUserRole],
    bookables: [sampleBookable, sampleBookableSecond],
    mapObjects: [sampleMapObject, sampleMapObjectSecond],
    bookings: [sampleBooking],
  };
}
