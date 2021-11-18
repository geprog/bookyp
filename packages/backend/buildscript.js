/** eslint-env node */
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    platform: 'node',
    bundle: true,
    minify: process.env.node_env === 'production',
    external: ['koa', 'hapi', 'saslprep'],
    sourcemap: true,
    tsconfig: './tsconfig.build.json',
  })
  .catch(() => {
    process.exit(1);
  });
