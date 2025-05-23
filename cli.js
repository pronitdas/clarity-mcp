#!/usr/bin/env node
import('./dist/bundle.js').catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 