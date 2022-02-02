import { mocked } from 'ts-jest/utils';

import { getId, PotentialIds } from '~/compositions/useFeathers';

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
    jest.mock('@geprog/vite-plugin-env-config');
    const socketioClient = await import('socket.io-client');
    const { getEnvConfig } = await import('@geprog/vite-plugin-env-config');
    const BACKEND_URL = '123';
    const getEnvConfigMock = mocked(getEnvConfig, true);
    getEnvConfigMock.mockReturnValueOnce(BACKEND_URL);
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

  describe('utility method for getting Id from items', () => {
    it('should return "id" property from item', () => {
      // given
      const item = { id: 1 };

      // then
      expect(getId(item)).toBe(item.id);
    });

    it('should return "_id" property from item', () => {
      // given
      const item = { _id: 1 };

      // then
      expect(getId(item)).toBe(item._id);
    });

    it('should throw error if no id could be retrieved from item', () => {
      // given
      const item = { name: 1 };

      // then
      expect(() => getId(item as PotentialIds)).toThrow('Unable to retrieve id from item');
    });
  });
});
