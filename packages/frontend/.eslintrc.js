/* eslint-env node */

require('@geprog/eslint-config/patch/modern-module-resolution');

module.exports = {
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },

  extends: ['@geprog/eslint-config/vue'],

  rules: {
    '@intlify/vue-i18n/no-unused-keys': [
      'error',
      {
        enableFix: true,
      },
    ],
    'vue/no-bare-strings-in-template': [
      'error',
      {
        attributes: {
          '/.+/': [
            'alt',
            'aria-label',
            'aria-placeholder',
            'aria-roledescription',
            'aria-valuetext',
            'label',
            'placeholder',
            'text',
            'title',
          ],
        },
      },
    ],
  },
};
