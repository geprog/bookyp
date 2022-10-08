import { Application } from '@bookyp/core';
import { MockedObject } from 'vitest';

import getConfig, { Config } from '~/config';

export const prepareAppMock = (): MockedObject<Application> =>
  ({
    configure: vi.fn(),
    service: vi.fn().mockImplementation(() => ({
      hooks: vi.fn(),
    })),
    use: vi.fn(),
    setup: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    hooks: vi.fn(),
    version: '4.0.0',
  } as MockedObject<Application>);

export const prepareGetConfigMockOnce = (config: Partial<Config>): void => {
  vi.mocked(getConfig).mockReturnValueOnce(config as Config);
};
