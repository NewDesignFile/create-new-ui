import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/new.js',
      name: 'CreateNewUI',
      fileName: (format) => `new.${format}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: ['path', 'inquirer', 'chalk', 'commander', 'fs-extra'],
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      }
    }
  },
  resolve: {
    alias: {
      'path': 'path-browserify'
    }
  }
});