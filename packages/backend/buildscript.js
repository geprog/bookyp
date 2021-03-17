/** eslint-env node */
const esbuild = require('esbuild');
const pnpPlugin = require('esbuild-plugin-pnp');
const path = require('path');
const rootPath = require('pkg-dir').sync();

// Source: https://github.com/yarnpkg/berry/issues/2549#issuecomment-788833177
const resolveRootAlias = {
  name: 'root-alias',
  setup(build) {
    const re = /^~\//;

    build.onResolve({ filter: re }, (args) => {
      const resolvedPath = path.join(rootPath, 'src', `${args.path.replace(re, '')}.ts`);

      return {
        path: resolvedPath,
      };
    });
  },
};

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    platform: 'node',
    bundle: true,
    minify: true,
    sourcemap: true,
    tsconfig: './tsconfig.build.json',
    plugins: [
      resolveRootAlias,
      pnpPlugin({
        external: ['mongodb-client-encryption', 'aws4'],
      }),
    ],
  })
  .catch(() => {
    process.exit(1);
  });
