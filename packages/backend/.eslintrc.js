/* eslint-env node */

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['@bookyp', '@bookyp/eslint-config/jest'],

  env: {
    node: true,
  },

  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
};
