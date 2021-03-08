import { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

import { compilerOptions } from './tsconfig.json';

const moduleNameMapper = {
  ...pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/' + compilerOptions.baseUrl + '/',
  }),
  '@bookyp/core': '<rootDir>/../core/mocks',
} as Config.InitialOptions['moduleNameMapper'];

const config: Config.InitialOptions = {
  roots: ['<rootDir>/test'],
  moduleNameMapper,
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  collectCoverage: true,
  coverageReporters: ['json'],
};

export default config;
