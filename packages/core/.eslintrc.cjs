/* eslint-env node */
module.exports = {
  extends: ['../../.eslintrc.js', '../../.eslintrc-jest.js'],

  env: {
    'shared-node-browser': true,
  },

  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['cjs'],
  },
};
