import { createApplication } from '@bookyp/core';
import socketio from '@feathersjs/socketio-client';
import { getEnvConfig } from '@geprog/vite-plugin-env-config';
import { io } from 'socket.io-client';

import { getId, PotentialIds } from '~/compositions/useFeathers';

vi.mock('@bookyp/core', () => ({
  createApplication: vi.fn().mockImplementation(() => ({
    configure: vi.fn(),
    service: vi.fn().mockImplementation(() => ({
      hooks: vi.fn(),
    })),
    use: vi.fn(),
    setup: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    version: '4.0.0',
  })),
}));

const connect = vi.fn();
vi.mock('socket.io-client', () => ({
  io: vi.fn().mockImplementation(() => ({
    connect,
  })),
}));

vi.mock('@feathersjs/socketio-client');
vi.mock('@geprog/vite-plugin-env-config');

describe('Feathers composition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should use @bookyp/core createApplication', async () => {
    expect.assertions(1);
    // given
    const useFeathers = await import('~/compositions/useFeathers');

    // when
    useFeathers.default();

    // then
    expect(createApplication).toHaveBeenCalledTimes(1);
  });

  it('should init a socket with socket.io-client with @feathersjs/socketio-client', async () => {
    expect.assertions(2);
    // given
    const useFeathers = await import('~/compositions/useFeathers');

    // when
    useFeathers.default();

    // then
    expect(socketio).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith({
      path: '/api/v1/socket',
      transports: ['websocket'],
      autoConnect: false,
    });
  });

  it('should init a socket with a specific backend url', async () => {
    expect.assertions(1);
    // given
    const BACKEND_URL = '123';
    vi.mocked(getEnvConfig).mockReturnValueOnce(BACKEND_URL);
    const useFeathers = await import('~/compositions/useFeathers');

    // when
    useFeathers.default();

    // then
    expect(io).toHaveBeenCalledWith(BACKEND_URL, {
      path: '/api/v1/socket',
      transports: ['websocket'],
      autoConnect: false,
    });
  });

  it('should connect to the socket', async () => {
    expect.assertions(1);
    // given
    const useFeathers = await import('~/compositions/useFeathers');
    useFeathers.default();

    // when
    useFeathers.connect();

    // then
    expect(connect).toHaveBeenCalledOnce();
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
