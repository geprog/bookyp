const WebpackWindiCSSPlugin = require('windicss-webpack-plugin').default;

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-postcss'],
  webpackFinal: (config: any) => {
    const tailwindConfigPath = __dirname + '/../../frontend/tailwind.config.ts';
    config.plugins.push(
      new WebpackWindiCSSPlugin({
        config: tailwindConfigPath,
        scan: {
          dirs: [__dirname + '/../src', __dirname + '/../../frontend/src'],
        },
      }),
    );
    return config;
  },
};
