/* eslint-env node */
module.exports = {
  extends: ['../../.eslintrc.js'],

  env: {
    'shared-node-browser': true,
  },

  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['cjs'],
  },
};
