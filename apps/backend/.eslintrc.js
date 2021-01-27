/* eslint-env node */
module.exports = {
  extends: ['../../.eslintrc.js'],

  env: {
    node: true,
  },

  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
};
