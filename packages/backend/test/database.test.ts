import getConfig from '~/config';

jest.mock('mongoose');
jest.mock('~/config');

describe('Database', () => {
  it('should successfully connect with an uri', async () => {
    expect.assertions(2);
    // given
    const uri = 'fake-uri';
    (getConfig as jest.Mock).mockReturnValueOnce({
      db: {
        uri,
      },
    });

    const mongoose = await import('mongoose');
    const { connect: connectDatabase } = await import('~/database');

    // when
    await connectDatabase();

    // then
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(uri, expect.anything());
  });

  it('should throw an error if not db uri has been provided', async () => {
    expect.assertions(1);
    // given
    (getConfig as jest.Mock).mockReturnValueOnce({
      db: {
        uri: '',
      },
    });
    const { getConnectionUri } = await import('~/database');

    // when
    // then
    expect(getConnectionUri).toThrow('Please set BACKEND_DB_URI');
  });
});
