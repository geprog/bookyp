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

export const sampleConfig = <Config>{
  app: {
    host: 'localhost',
    port: 4000,
    secret: 'i-wont-tell-you',
    frontendUrl: undefined,
    backendUrl: undefined,
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
  s3: {
    accessKey: 'i-wont-tell-you',
    bucket: 'bookyp',
    endpoint: 'https://s3.eu-central-1.amazonaws.com',
    port: 443,
    useSSL: true,
    publicFileUrlPrefix: 'https://s3.eu-central-1.amazonaws.com/bookyp',
    publicUploadUrlPrefix: 'https://s3.eu-central-1.amazonaws.com/bookyp',
    secretKey: 'i-wont-tell-you',
  },
  mail: {
    host: 'mail.example.org',
    port: 587,
    secure: false,
    from: 'Bookyp',
    password: 'i-wont-tell-you',
    requireTLS: true,
    username: 'bookyp',
  },
  payment: {
    gringottsToken: 'i-wont-tell-you',
    gringottsUrl: 'https://api.gringotts.example.org',
  },
};
