const esbuild = require('esbuild');
const { chmod, writeFile, mkdir, rm } = require('fs/promises');
const { dirname } = require('path');

async function build() {
  try {
    // Clean dist directory
    await rm('dist', { recursive: true, force: true });
    
    // Ensure dist directory exists
    await mkdir('dist', { recursive: true });

    // Build the main code
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
        '.html': 'text' // Handle HTML files as text
      }
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