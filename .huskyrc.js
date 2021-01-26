/** eslint-env node */
module.exports = {
  "hooks": {
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
    "pre-commit": "yarn lint:changed",
    "pre-push": "yarn test:changed",
  },
};
