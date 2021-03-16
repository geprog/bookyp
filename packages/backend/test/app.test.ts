import { jest } from '@jest/globals';

describe('app initialization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('shall use @bookyp/core createApplication', async () => {
    expect.assertions(1);
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');

    // when
    await import('~/app');

    // then
    expect(bookypCore.createApplication).toHaveBeenCalledTimes(1);
  });

  it('shall init a socket with @feathersjs/socketio', async () => {
    expect.assertions(1);
    // given
    jest.mock('@feathersjs/socketio');
    const socketio = await import('@feathersjs/socketio');

    // when
    await import('~/app');

    // then
    expect(socketio.default).toHaveBeenCalledWith({
      path: '/api/v1/socket',
      serveClient: false,
    });
  });
});
