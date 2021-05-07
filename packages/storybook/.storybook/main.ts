const WebpackWindiCSSPlugin = require('windicss-webpack-plugin').default;
const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-postcss'],
  webpackFinal: (config: any) => {
    const frontendPath = __dirname + '/../../frontend';
    const tailwindConfigPath = frontendPath + '/tailwind.config.ts';
    config.plugins.push(
      new WebpackWindiCSSPlugin({
        config: tailwindConfigPath,
        scan: {
          dirs: [__dirname + '/../src', frontendPath + '/src'],
        },
      }),
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(frontendPath, 'src/'),
    };
    return config;
  },
};
