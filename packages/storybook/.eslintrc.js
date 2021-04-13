/* eslint-env node */

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },

  extends: ['@bookyp'],

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
