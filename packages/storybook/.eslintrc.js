/* eslint-env node */

require('@geprog/eslint-config/patch/modern-module-resolution');

module.exports = {
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },

  extends: ['@geprog'],

  rules: {
    // allow importing frontend components from `src` folder
    'no-restricted-imports': [
      'error',
      {
        patterns: ['dist'],
      },
    ],
  },
};
