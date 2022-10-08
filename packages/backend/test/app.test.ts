import { createApplication } from '@bookyp/core';

import { prepareAppMock } from './__helpers__/mocks';

vi.mock('@bookyp/core', () => ({
  createApplication: vi.fn().mockImplementation(() => prepareAppMock()),
  Model: {
    MapObjectTypes: {},
  },
}));

describe('App', () => {
  it('should use @bookyp/core createApplication', async () => {
    expect.assertions(1);
    // given

    // when
    await import('~/app');

    // then
    expect(createApplication).toHaveBeenCalledTimes(1);
  });

  it('should init a socket with @feathersjs/socketio', async () => {
    expect.assertions(1);
    // given
    vi.mock('@feathersjs/socketio');
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
