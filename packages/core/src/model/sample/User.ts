import { Model } from '~/index';

export const sampleUser = new Model.User({
  email: 'herbert@example.com',
  name: 'Herbert',
  deleted: false,
});

export const sampleUsers = [sampleUser];
