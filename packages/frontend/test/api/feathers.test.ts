describe('feathers api initialization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('shall use @bookyp/core createApplication', async () => {
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');

    // when
    await import('~/api/feathers');

    // then
    expect(bookypCore.createApplication).toBeCalledTimes(1);
  });

  it('shall init a socket with socket.io-client with @feathersjs/socketio-client', async () => {
    // given
    jest.mock('@feathersjs/socketio-client');
    const feathersSocketioClient = await import('@feathersjs/socketio-client');
    jest.mock('socket.io-client');
    const socketioClient = await import('socket.io-client');

    // when
    await import('~/api/feathers');

    // then
    expect(feathersSocketioClient.default).toBeCalledTimes(1);
    expect(socketioClient.default).toBeCalledWith({
      path: '/api/v1/socket',
      transports: ['websocket'],
      autoConnect: true,
    });
  });
});
