const esbuild = require('esbuild');
const { chmod, writeFile, mkdir } = require('fs/promises');
const { dirname } = require('path');

async function build() {
  try {
    // Ensure dist directory exists
    await mkdir('dist', { recursive: true });

    // Build the main code first
    await esbuild.build({
      entryPoints: ['index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      outfile: 'dist/index.js',
      sourcemap: true,
      minify: false,
      external: [
        '@modelcontextprotocol/sdk',
        'chalk'
      ]
    });

    // Create the entry point with shebang
    const entryPoint = `#!/usr/bin/env node
require('./index.js');`;

    // Write the entry point
    await writeFile('dist/bundle.js', entryPoint);
    await chmod('dist/bundle.js', 0o755);
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 