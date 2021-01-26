import { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/' + compilerOptions.baseUrl + '/',
});

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  moduleNameMapper,
};

export default config;
