import esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

const isServe = process.argv.includes('serve');
const isBuild = process.argv.includes('build');

const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  jsx: 'automatic',
  define: {
    __DEV__: isServe ? 'true' : 'false',
  },
  loader: {
    '.tsx': 'tsx',
    '.ts': 'tsx',
    '.css': 'css',
  },
};

if (isServe) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  const { host, port } = await ctx.serve({
    servedir: '.',
    port: 3000,
    host: '0.0.0.0',
  });
  console.log(`Dev server running at http://${host}:${port}`);
} else if (isBuild) {
  await esbuild.build({
    ...config,
    minify: true,
    sourcemap: false,
  });
  const html = readFileSync('index.html', 'utf-8').replaceAll('dist/', '');
  writeFileSync('dist/index.html', html);
  console.log('Build complete.');
} else {
  console.log('Usage: node esbuild.config.mjs [serve|build]');
}
