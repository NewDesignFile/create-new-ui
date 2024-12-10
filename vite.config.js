import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/new.js',
      name: 'CreateNewUI',
      fileName: (format) => `new.${format}.js`,
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
  resolve: {
    alias: {
      'path': 'path-browserify',
      'module': 'module-browserify',
    },
  },
});