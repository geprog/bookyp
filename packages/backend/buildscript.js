/** eslint-env node */
const esbuild = require('esbuild');
const pnpPlugin = require('esbuild-plugin-pnp');

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    platform: 'node',
    bundle: true,
    minify: true,
    sourcemap: true,
    tsconfig: './tsconfig.build.json',
    plugins: [pnpPlugin()],
  })
  .catch(() => {
    process.exit(1);
  });
