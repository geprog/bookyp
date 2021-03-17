describe('Database', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should successfully connect with an uri', async () => {
    expect.assertions(2);
    // given
    const uri = 'fake-uri';

    jest.mock('mongoose');
    jest.mock('~/config', () => {
      return () => ({
        db: {
          uri,
        },
      });
    });

    const mongoose = await import('mongoose');
    const { connect: connectDatabase } = await import('~/database');

    // when
    await connectDatabase();

    // then
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(uri, expect.anything());
  });

  it('should successfully connect with separate settings', async () => {
    expect.assertions(2);
    // given
    const dbConfig = {
      host: '127.0.0.1',
      port: 1234,
      name: 'test-database',
    };
    const expectedUri = `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`;

    jest.mock('mongoose');
    jest.mock('~/config', () => {
      return () => ({
        db: dbConfig,
      });
    });

    const mongoose = await import('mongoose');
    const { connect: connectDatabase } = await import('~/database');

    // when
    await connectDatabase();

    // then
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(expectedUri, expect.anything());
  });

  it('should successfully connect with separate settings and credentials', async () => {
    expect.assertions(2);
    // given
    const dbConfig = {
      host: '127.0.0.1',
      port: 1234,
      name: 'test-database',
      user: 'test-user',
      password: 'test-password',
    };
    const expectedUri = `mongodb://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}?authSource=admin`;

    jest.mock('mongoose');
    jest.mock('~/config', () => {
      return () => ({
        db: dbConfig,
      });
    });

    const mongoose = await import('mongoose');
    const { connect: connectDatabase } = await import('~/database');

    // when
    await connectDatabase();

    // then
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(expectedUri, expect.anything());
  });
});
