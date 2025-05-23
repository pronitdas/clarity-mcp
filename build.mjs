import * as esbuild from 'esbuild';
import { readFile, writeFile } from 'fs/promises';

// Build the main bundle
await esbuild.build({
  entryPoints: ['dist/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/bundle.js',
  external: [
    // External dependencies that should not be bundled
    '@modelcontextprotocol/sdk',
    'chalk'
  ]
});

// Make CLI executable
await esbuild.build({
  entryPoints: ['cli.js'],
  bundle: false,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/cli.js',
});

// Update package.json to point to CLI
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
packageJson.main = 'dist/bundle.js';
packageJson.bin['clear-thought-mcp-server'] = 'dist/cli.js';
await writeFile('package.json', JSON.stringify(packageJson, null, 2)); 