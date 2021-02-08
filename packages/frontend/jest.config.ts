import { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const moduleNameMapper = {
  ...pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/' + compilerOptions.baseUrl + '/',
  }),
  '@bookyp/core': '<rootDir>/../core/mocks',
  '@feathersjs/transport-commons/src/client': '<rootDir>/test/__mocks__/feathersjs-transport-commons-client.ts',
};

const config: Config.InitialOptions = {
  roots: ['<rootDir>/test'],
  moduleNameMapper,
  testEnvironment: 'jest-environment-jsdom',
  transform: {},
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;
