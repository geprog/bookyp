import antfu from '@antfu/eslint-config';

export default antfu(
  {
    // helm templates are not valid yaml
    ignores: ['.ci/charts/**/templates/**'],
    vue: true,
    typescript: true,
    formatters: {
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
     * By default uses Prettier
     */
      css: true,
      /**
       * Format HTML files
       * By default uses Prettier
       */
      html: true,
      /**
       * Format Markdown files
       * Supports Prettier and dprint
       * By default uses Prettier
       */
      markdown: 'prettier',
    },
    rules: {
      'style/semi': ['error', 'always'],
      'style/member-delimiter-style': ['error', {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'semi', requireLast: false },
      }],
      // console output is the logging of the server
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': ['error', {
        order: [['template', 'script'], 'style'],
      }],
    },
  },
);
