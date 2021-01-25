/* eslint-env node */
/** @type {import('vls').VeturConfig} */
module.exports = {
  // **optional** default: `{}`
  // override vscode settings
  // Notice: It only affects the settings used by Vetur.
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': true,
    'vetur.completion.tagCasing': 'kebap',
    'vetur.validation.templateProps': true,
  },
  // **optional** default: `[{ root: './' }]`
  // support monorepos
  projects: [
    './app/frontend', // shorthand for only root.
  ],
};
