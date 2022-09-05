import { jest } from '@jest/globals';

// eslint-disable-next-line no-restricted-imports, import/no-relative-parent-imports
import { MapObjectTypes } from '../src/model/TemplateGenerator';

export const createApplication = jest.fn().mockImplementation(() => ({
  configure: jest.fn(),
  service: jest.fn().mockImplementation(() => ({
    hooks: jest.fn(),
  })),
  use: jest.fn(),
  setup: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  hooks: jest.fn(),
  version: '4.0.0',
}));

/*
 * TODO: #116
 * at runtime some of models properties are needed
 *  add them here
 *  the other ones are just needed for type checking and are not needed in tests
 */
export const Model = {
  MapObjectTypes,
};
