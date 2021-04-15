import { mocked } from 'ts-jest/utils';

describe('Feathers composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should use @bookyp/core createApplication', async () => {
    expect.assertions(1);
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const useFeathers = await import('~/compositions/useFeathers');

    // when
    useFeathers.default();

    // then
    expect(bookypCore.createApplication).toHaveBeenCalledTimes(1);
  });

  it('should init a socket with socket.io-client with @feathersjs/socketio-client', async () => {
    expect.assertions(2);
    // given
    jest.mock('@feathersjs/socketio-client');
    const feathersSocketioClient = await import('@feathersjs/socketio-client');
    jest.mock('socket.io-client');
    const socketioClient = await import('socket.io-client');
    const useFeathers = await import('~/compositions/useFeathers');

    // when
    useFeathers.default();

    // then
    expect(feathersSocketioClient.default).toHaveBeenCalledTimes(1);
    expect(socketioClient.io).toHaveBeenCalledWith({
      path: '/api/v1/socket',
      transports: ['websocket'],
      autoConnect: false,
    });
  });

  it('should init a socket with a specific backend url', async () => {
    expect.assertions(1);
    // given
    jest.mock('@feathersjs/socketio-client');
    jest.mock('socket.io-client');
    jest.mock('~/compositions/useAppConfig');
    const socketioClient = await import('socket.io-client');
    const useAppConfig = await import('~/compositions/useAppConfig');
    const BACKEND_URL = '123';
    const useAppConfigMock = mocked(useAppConfig, true);
    useAppConfigMock.getConfig.mockReturnValueOnce(BACKEND_URL);
    const useFeathers = await import('~/compositions/useFeathers');

    // when
    useFeathers.default();

    // then
    expect(socketioClient.io).toHaveBeenCalledWith(BACKEND_URL, {
      path: '/api/v1/socket',
      transports: ['websocket'],
      autoConnect: false,
    });
  });

  it('should connect to the socket', async () => {
    expect.assertions(1);
    // given
    jest.mock('socket.io-client');
    const { io } = await import('socket.io-client');
    const socket = io();
    const useFeathers = await import('~/compositions/useFeathers');
    useFeathers.default();

    // when
    useFeathers.connect();

    // then
    expect(socket.connect).toHaveBeenCalledWith();
  });

  it('should re-use an already initialized application', async () => {
    expect.assertions(1);
    // given
    const useFeathers = await import('~/compositions/useFeathers');
    const app1 = useFeathers.default();

    // when
    const useFeathers2 = await import('~/compositions/useFeathers');
    const app2 = useFeathers2.default();

    // then
    expect(app1).toStrictEqual(app2);
  });
});
