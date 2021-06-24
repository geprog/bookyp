import { AppConfig } from '~/compositions/useAppConfig';

describe('useAppConfig composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should get some config value', async () => {
    expect.assertions(3);
    // given
    const config: AppConfig = {
      BACKEND_URL: '123',
      SSO_AUTH_URL: '456',
      SSO_AUTH_LOGOUT_ENDPOINT: '789',
    };
    (window as unknown as { env: AppConfig }).env = config;
    const useAppConfig = await import('~/compositions/useAppConfig');

    // when
    const configBackendUrl = useAppConfig.getConfig('BACKEND_URL');
    const configAuthUrl = useAppConfig.getConfig('SSO_AUTH_URL');
    const configAuthLogout = useAppConfig.getConfig('SSO_AUTH_LOGOUT_ENDPOINT');

    // then
    expect(configBackendUrl).toStrictEqual(config.BACKEND_URL);
    expect(configAuthUrl).toStrictEqual(config.SSO_AUTH_URL);
    expect(configAuthLogout).toStrictEqual(config.SSO_AUTH_LOGOUT_ENDPOINT);
  });
});
