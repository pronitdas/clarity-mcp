const esbuild = require('esbuild');
const { chmod, writeFile, mkdir, rm } = require('fs/promises');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} in ${cwd}`);
    const child = spawn('bash', ['-c', command], {
      cwd,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${command}`));
      }
    });
  });
}

async function setupPythonServer() {
  console.log('🐍 Setting up Python embedding server...');
  
  const serverDir = 'python-server';
  await mkdir(serverDir, { recursive: true });
  
  // Verify Python server files exist
  const pythonFiles = [
    'python-server/embedding_server.py',
    'python-server/requirements.txt',
    'python-server/start_server.sh'
  ];
  
  let allFilesExist = true;
  for (const file of pythonFiles) {
    if (!fs.existsSync(file)) {
      console.warn(`❌ Warning: ${file} not found`);
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    throw new Error('Missing Python server files');
  }
  
  console.log('📦 Creating Python virtual environment...');
  
  // Remove existing venv if it exists
  const venvPath = path.join(serverDir, 'venv');
  if (fs.existsSync(venvPath)) {
    await rm(venvPath, { recursive: true, force: true });
  }
  
  // Create virtual environment
  await runCommand('python3 -m venv venv', serverDir);
  
  console.log('📥 Installing Python dependencies...');
  
  try {
    // Install dependencies in virtual environment
    const installCmd = `source venv/bin/activate && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt`;
    await runCommand(installCmd, serverDir);
    
    console.log('🧪 Testing Python server setup...');
    
    // Test that we can import the required modules
    const testCmd = `source venv/bin/activate && python3 -c "
import fastapi
import uvicorn
import numpy as np
import pydantic
import requests
print('✅ All required Python packages installed successfully')
try:
    import sentence_transformers
    print('✅ sentence-transformers available')
except ImportError:
    print('⚠️  sentence-transformers not available (will use fallback)')
try:
    import transformers
    import torch
    print('✅ transformers and torch available')  
except ImportError:
    print('⚠️  transformers/torch not available (will use fallback)')
"`;
    
    await runCommand(testCmd, serverDir);
    console.log('✅ Python embedding server setup completed successfully!');
    
  } catch (error) {
    console.warn('⚠️  Full ML installation failed, trying minimal installation...');
    
    try {
      // Try minimal installation without ML packages
      const minimalCmd = `source venv/bin/activate && pip install fastapi uvicorn numpy pydantic requests`;
      await runCommand(minimalCmd, serverDir);
      
      const minimalTestCmd = `source venv/bin/activate && python3 -c "
import fastapi
import uvicorn
import numpy as np
import pydantic
import requests
print('✅ Minimal Python packages installed successfully')
print('⚠️  Will use hash-based fallback embeddings')
"`;
      
      await runCommand(minimalTestCmd, serverDir);
      console.log('✅ Minimal Python server setup completed (fallback mode)!');
      
    } catch (minimalError) {
      console.error('❌ Even minimal Python setup failed:', minimalError.message);
      console.error('🔧 Please ensure Python 3.7+ is installed and working');
      console.error('💡 You can also set up the Python environment manually:');
      console.error('   cd python-server && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt');
      throw minimalError;
    }
  }
}

async function build() {
  try {
    // Clean dist directory
    await rm('dist', { recursive: true, force: true });
    
    // Ensure dist directory exists
    await mkdir('dist', { recursive: true });

    // Setup Python server with dependencies
    await setupPythonServer();

    // Build the main bundle
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
        'axios',
        'uuid',
        // Node built-ins and system dependencies
        'child_process',
        'path',
        'fs',
        'fs/promises'
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
    
    console.log('✅ Build completed successfully!');
    console.log('');
    console.log('🐍 Python Embedding Server:');
    console.log('   ✅ Virtual environment created');
    console.log('   ✅ Dependencies installed');
    console.log('   ✅ Ready for automatic startup');
    console.log('');
    console.log('📦 To run the server:');
    console.log('   npm start  or  node dist/index.js');
    console.log('');
    console.log('🧪 To test the Python server separately:');
    console.log('   cd python-server && source venv/bin/activate && python3 test_server.py');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build(); 