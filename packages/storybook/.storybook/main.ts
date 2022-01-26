const path = require('path');
const WindiCSS = require('vite-plugin-windicss').default;
const svgLoader = require('vite-svg-loader');

const frontendPath = __dirname + '/../../frontend';

module.exports = {
  core: {
    builder: 'storybook-builder-vite',
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-postcss'],
  async viteFinal(config: any) {
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

    // fix for storybook build https://github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
    config.resolve.dedupe = ['@storybook/client-api'];

    // https://github.com/eirslett/storybook-builder-vite/issues/55#issuecomment-871800293
    config.root = path.dirname(require.resolve('storybook-builder-vite'));

    return config;
  },
};
