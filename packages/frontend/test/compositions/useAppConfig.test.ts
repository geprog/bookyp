import { AppConfig } from '~/compositions/useAppConfig';

describe('useAppConfig composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should get some config value', async () => {
    expect.assertions(1);
    // given
    const config: AppConfig = {
      BACKEND_URL: '123',
    };
    (window as unknown as { env: AppConfig }).env = config;
    const useAppConfig = await import('~/compositions/useAppConfig');

    // when
    const configBackendUrl = useAppConfig.getConfig('BACKEND_URL');

    // then
    expect(configBackendUrl).toStrictEqual(config.BACKEND_URL);
  });
});
