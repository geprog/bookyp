import mongoose from 'mongoose';

import { getConnectionUri } from '~/database';
import { prepareGetConfigMockOnce } from '$/__helpers__/mocks';

vi.mock('mongoose');
vi.mock('~/config');

describe('Database', () => {
  it('should successfully connect with an uri', async () => {
    expect.assertions(2);
    // given
    const uri = 'fake-uri';
    prepareGetConfigMockOnce({
      db: {
        uri,
      },
    });

    const { connect: connectDatabase } = await import('~/database');

    // when
    await connectDatabase();

    // then
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(uri);
  });

  it('should throw an error if not db uri has been provided', () => {
    expect.assertions(1);
    // given
    prepareGetConfigMockOnce({
      db: {
        uri: '',
      },
    });

    // when
    // then
    expect(getConnectionUri).toThrow('Please set BACKEND_DB_URI');
  });
});
