const path = require('path');
const WindiCSS = require('vite-plugin-windicss').default;
const svgLoader = require('vite-svg-loader');

module.exports = {
  core: {
    builder: 'storybook-builder-vite',
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-postcss'],
  async viteFinal(config: any) {
    const frontendPath = __dirname + '/../../frontend';
    // windicss configuration used from frontend
    const tailwindConfigPath = frontendPath + '/tailwind.config.ts';
    config.plugins.push(
      WindiCSS({
        config: tailwindConfigPath,
        scan: {
          dirs: [__dirname + '/../src', frontendPath + '/src'],
        },
      }),
    );
    // register path for frontend internal imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(frontendPath, 'src/'),
    };
    // svg loader
    config.plugins.push(svgLoader());
    return config;
  },
};
