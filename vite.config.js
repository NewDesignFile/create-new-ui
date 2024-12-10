import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: 'src/new.js',
      name: 'CreateNewUI',
      fileName: (format) => `new.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['fs-extra', 'inquirer', 'chalk', 'commander', 'path', 'module'],
      output: {
        globals: {
          'fs-extra': 'fsExtra',
          'inquirer': 'inquirer',
          'chalk': 'chalk',
          'commander': 'commander',
          'path': 'path',
          'module': 'module',
        },
      },
    },
  },
  plugins: [
    {
      name: 'add-shebang',
      generateBundle(options, bundle) {
        const files = Object.keys(bundle);
        files.forEach(fileName => {
          const file = bundle[fileName];
          if (file.type === 'chunk') {
            file.code = `#!/usr/bin/env node\n${file.code}`;
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      'path': 'path-browserify',
      'module': 'module-browserify',
    },
  },
});