/* eslint-env node */

require('@geprog/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@geprog', '@geprog/eslint-config/jest'],

  env: {
    node: true,
  },

  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
};
