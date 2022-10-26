import { createApplication } from '@bookyp/core';
import socketio from '@feathersjs/socketio';

import { configureApplication } from '~/app';

import { prepareAppMock } from './__helpers__/mocks';

vi.mock('@feathersjs/socketio');
vi.mock('@bookyp/core', () => ({
  createApplication: vi.fn().mockImplementation(() => prepareAppMock()),
  Model: {
    MapObjectTypes: {},
  },
}));

describe('App', () => {
  it('should use @bookyp/core createApplication', () => {
    expect.assertions(1);
    // given

    // when
    configureApplication();

    // then
    expect(createApplication).toHaveBeenCalledTimes(1);
  });

  it('should init a socket with @feathersjs/socketio', () => {
    expect.assertions(1);
    // given

    // when
    configureApplication();

    // then
    expect(socketio).toHaveBeenCalledWith({
      path: '/api/v1/socket',
      serveClient: false,
    });
  });
});
