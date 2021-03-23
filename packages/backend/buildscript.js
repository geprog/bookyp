/** eslint-env node */
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    platform: 'node',
    bundle: true,
    minify: true,
    external: ['koa', 'hapi'],
    sourcemap: true,
    tsconfig: './tsconfig.build.json',
  })
  .catch(() => {
    process.exit(1);
  });
