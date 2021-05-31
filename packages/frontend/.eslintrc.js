/* eslint-env node */

require('@geprog/eslint-config/patch/modern-module-resolution');

module.exports = {
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },

  extends: ['@geprog/eslint-config/vue'],
};
