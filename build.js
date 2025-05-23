const esbuild = require('esbuild');
const { chmod, writeFile, mkdir, rm } = require('fs/promises');
const { dirname } = require('path');

async function build() {
  try {
    // Clean dist directory
    await rm('dist', { recursive: true, force: true });
    
    // Ensure dist directory exists
    await mkdir('dist', { recursive: true });

    // First build the main bundle without shebang
    await esbuild.build({
      entryPoints: ['index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      outfile: 'dist/index.js',
      sourcemap: 'external',
      minify: false,
      external: [
        // Core externals
        '@modelcontextprotocol/sdk',
        'chalk',
        // TensorFlow related
        '@tensorflow/tfjs-node',
        '@tensorflow-models/universal-sentence-encoder',
        // AWS and testing related (from node-pre-gyp)
        'aws-sdk',
        'mock-aws-s3',
        'nock',
        '@mapbox/node-pre-gyp'
      ],
      loader: {
        '.html': 'text'
      }
    });

    // Create the CLI wrapper
    const cliWrapper = `#!/usr/bin/env node
require('./index.js');`;

    // Write the CLI wrapper
    await writeFile('dist/bundle.js', cliWrapper);
    await chmod('dist/bundle.js', 0o755);
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 