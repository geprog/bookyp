/* eslint-env node */
const vueJest = require('vue3-jest');

/**
 * Inspired by here https://vue-svg-loader.js.org/faq.html#how-to-use-this-loader-with-jest
 * but this was not working with the vite-svg-loader and jest out of the box so
 * I implemented it manually, to mirror that behavior
 */
module.exports = {
  process(content, filename, config) {
    const code = `<template>${content.replace('\n', '')}</template>`;
    return vueJest.process(code, filename, config);
  },
  getCacheKey: (fileData, filename, configString, options) =>
    vueJest.getCacheKey(fileData, filename, configString, options),
};
