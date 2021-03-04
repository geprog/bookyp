describe('database', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('shall successfully connect with uri', async () => {
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
    expect(mongoose.connect).toBeCalledTimes(1);
    expect(mongoose.connect).toBeCalledWith(uri, expect.anything());
  });

  it('shall successfully connect with separate settings', async () => {
    // given
    const dbConfig = {
      host: '127.0.0.1',
      port: 1234,
      name: 'test-databae',
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
    expect(mongoose.connect).toBeCalledTimes(1);
    expect(mongoose.connect).toBeCalledWith(expectedUri, expect.anything());
  });

  it('shall successfully connect with separate settings and credentials', async () => {
    // given
    const dbConfig = {
      host: '127.0.0.1',
      port: 1234,
      name: 'test-databae',
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
    expect(mongoose.connect).toBeCalledTimes(1);
    expect(mongoose.connect).toBeCalledWith(expectedUri, expect.anything());
  });
});
