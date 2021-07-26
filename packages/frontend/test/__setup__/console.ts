/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/require-top-level-describe */
// adapted from https://github.com/facebook/jest/issues/6121

// run before each test file
const spyError = jest.spyOn(global.console, 'error');
const spyWarn = jest.spyOn(global.console, 'warn');

// run after each test file
afterAll(() => {
  expect(spyError).not.toHaveBeenCalled();
  expect(spyWarn).not.toHaveBeenCalled();
});
