import * as bookypCore from '@bookyp/core';

import getConfig from '~/config';
import serviceIndex from '~/services';
import AuthenticationService from '~/services/authentication/authentication.service';

jest.mock('~/config');
jest.mock('@bookyp/core');

const configMockReturnValue = {
  app: {
    host: 'localhost',
    port: 4000,
    secret: 'i-wont-tell-you',
  },
  oauth: {
    redirect_url: 'http://localhost:3000/',
    keycloak: {
      secret: 'i-wont-tell-you',
      client: 'bookyp',
      subdomain: 'auth.example.org/auth/realms/main',
    },
  },
  db: {
    uri: undefined,
    host: 'db',
    port: '27017',
    name: 'bookyp',
    user: 'admin',
    password: 'i-wont-tell-you',
  },
};

describe('Authentication service', () => {
  beforeEach(() => {
    // jest.resetAllMocks();
    jest.resetModules();
  });

  it('should configure the service', () => {
    // given
    (getConfig as jest.Mock).mockReturnValueOnce(configMockReturnValue);
    const app = bookypCore.createApplication();

    // when
    serviceIndex(app);

    // then
    expect(app.configure).toHaveBeenCalledWith(AuthenticationService);
  });

  it('should set auth config', () => {
    // given
    (getConfig as jest.Mock).mockReturnValueOnce(configMockReturnValue);
    const app = bookypCore.createApplication();

    // when
    AuthenticationService(app);

    // then
    expect(app.set).toHaveBeenCalledWith('authentication', expect.any(Object));
  });

  describe('Configuration', () => {
    it('should match snapshot', () => {
      // given
      (getConfig as jest.Mock).mockReturnValueOnce(configMockReturnValue);
      const app = bookypCore.createApplication();
      const spy = jest.spyOn(app, 'set');

      // when
      AuthenticationService(app);

      // then
      // check second argument of first call to app.set
      expect(spy.mock.calls[0][1]).toMatchSnapshot();
    });
  });
});
