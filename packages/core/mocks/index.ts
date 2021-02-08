import { jest } from '@jest/globals';

export const createApplication = jest.fn().mockImplementation(() => ({
  configure: jest.fn(),
}));
