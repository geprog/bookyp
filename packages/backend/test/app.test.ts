import { jest } from '@jest/globals';

describe('app initialization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('shall use @bookyp/core createApplication', async () => {
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    // when
    await import('@/app');
    // then
    expect(bookypCore.createApplication).toBeCalledTimes(1);
  });

  it('shall init a socket with @feathersjs/socketio', async () => {
    // given
    jest.mock('@feathersjs/socketio');
    const socketio = await import('@feathersjs/socketio');
    // when
    await import('@/app');
    // then
    expect(socketio.default).toBeCalledWith({
      path: '/api/v1/socket',
      serveClient: false,
    });
  });
});
