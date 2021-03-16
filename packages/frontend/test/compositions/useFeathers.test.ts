describe('feathers api initialization', () => {
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
    await import('~/compositions/useFeathers');

    // then
    expect(bookypCore.createApplication).toHaveBeenCalledTimes(1);
  });

  it('shall init a socket with socket.io-client with @feathersjs/socketio-client', async () => {
    expect.assertions(2);
    // given
    jest.mock('@feathersjs/socketio-client');
    const feathersSocketioClient = await import('@feathersjs/socketio-client');
    jest.mock('socket.io-client');
    const socketioClient = await import('socket.io-client');

    // when
    await import('~/compositions/useFeathers');

    // then
    expect(feathersSocketioClient.default).toHaveBeenCalledTimes(1);
    expect(socketioClient.io).toHaveBeenCalledWith({
      path: '/api/v1/socket',
      transports: ['websocket'],
      autoConnect: false,
    });
  });

  it('shall connect to the socket', async () => {
    expect.assertions(1);
    // given
    jest.mock('socket.io-client');
    const { io } = await import('socket.io-client');
    const socket = io();

    // when
    const { connect } = await import('~/compositions/useFeathers');
    connect();

    // then
    expect(socket.connect).toHaveBeenCalledWith();
  });
});
