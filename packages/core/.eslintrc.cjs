/* eslint-env node */

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['@bookyp', '@bookyp/eslint-config/jest'],

  env: {
    'shared-node-browser': true,
  },

  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['cjs'],
  },
};
