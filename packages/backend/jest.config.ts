import { Config } from '@jest/types';

const moduleNameMapper = {
  '^~/(.*)': '<rootDir>/src/$1',
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
  reporters: ['default', 'jest-junit'],
  collectCoverage: true,
  coverageReporters: ['json', 'text'],
  setupFilesAfterEnv: ['<rootDir>/test/__setup__/console.ts'],
};

export default config;
