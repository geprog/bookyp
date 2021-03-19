import { jest } from '@jest/globals';

export const createApplication = jest.fn().mockImplementation(() => ({
  configure: jest.fn(),
  service: jest.fn(),
  use: jest.fn(),
  setup: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  version: '4.0.0',
}));
