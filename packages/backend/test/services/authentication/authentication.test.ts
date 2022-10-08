import serviceIndex from '~/services';
import AuthenticationService from '~/services/authentication/authentication.service';
import { prepareAppMock, prepareGetConfigMockOnce } from '$/__helpers__/mocks';

vi.mock('~/config');

const configMockReturnValue = {
  app: {
    host: 'localhost',
    port: 4000,
    secret: 'i-wont-tell-you',
    frontendUrl: undefined,
  },
  oauth: {
    redirect_url: 'http://localhost:3000/',
    keycloak: {
      secret: 'i-wont-tell-you',
      client: 'bookyp',
      subdomain: 'auth.example.org/auth/realms/main',
    },
    defaults: {
      origin: undefined,
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
    // vi.resetAllMocks();
    vi.resetModules();
  });

  it('should configure the service', () => {
    // given
    prepareGetConfigMockOnce(configMockReturnValue);
    const app = prepareAppMock();

    // when
    serviceIndex(app);

    // then
    expect(app.configure).toHaveBeenCalledWith(AuthenticationService);
  });

  it('should set auth config', () => {
    // given
    prepareGetConfigMockOnce(configMockReturnValue);
    const app = prepareAppMock();

    // when
    AuthenticationService(app);

    // then
    expect(app.set).toHaveBeenCalledWith('authentication', expect.any(Object));
  });

  describe('Configuration', () => {
    it('should match snapshot', () => {
      // given
      prepareGetConfigMockOnce(configMockReturnValue);
      const app = prepareAppMock();

      // when
      AuthenticationService(app);

      // then
      // check second argument of first call to app.set
      expect(app.set.mock.calls[0][1]).toMatchSnapshot();
    });
  });
});
