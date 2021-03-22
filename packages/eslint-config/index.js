/* eslint-env node */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    sourceType: 'module',
    ecmaVersion: 2018,
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
  ],
  rules: {
    // make typescript eslint rules even more strict
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',

    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    'promise/prefer-await-to-then': 'error',
    'promise/prefer-await-to-callbacks': 'error',

    'prettier/prettier': 'error',
    'no-console': 'warn',
    'no-useless-concat': 'error',
    curly: ['error'],
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.{ts,vue}'],
      extends: ['plugin:@typescript-eslint/recommended-requiring-type-checking'],
    },
  ],
  reportUnusedDisableDirectives: true,
};
