import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^~/(.*)': '<rootDir>/src/$1',
  },
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
  coverageReporters: ['json', 'text', 'cobertura'],
  setupFilesAfterEnv: ['<rootDir>/test/__setup__/console.ts'],
};

export default config;
