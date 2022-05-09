import { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

import { compilerOptions } from './tsconfig.json';

const moduleNameMapper = {
  // https://github.com/jpkleemans/vite-svg-loader/issues/35
  '.+\\.(svg)(\\?component)?$': '<rootDir>/test/__mocks__/svgMock.vue',
  ...pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/' + compilerOptions.baseUrl + '/',
  }),
  '@bookyp/core': '<rootDir>/../core/mocks',
  '@feathersjs/transport-commons/src/client': '<rootDir>/test/__mocks__/feathersjs-transport-commons-client.ts',
} as Config.InitialOptions['moduleNameMapper'];

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  moduleNameMapper,
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.vue$': 'vue3-jest',
  },
  reporters: ['default', 'jest-junit'],
  collectCoverage: true,
  coverageReporters: ['json', 'text', 'cobertura'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx,vue}', '!**/node_modules/**'],
  setupFilesAfterEnv: ['<rootDir>/test/__setup__/console.ts', '<rootDir>/test/__setup__/render-stub-default-slot.ts'],
  globalSetup: '<rootDir>/test/__setup__/globalSetup.ts',
};

export default config;
