import { defineConfig } from 'vite';
  
  export default defineConfig({
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@new-ui/colors' as colors_0;
@use '@new-ui/effects' as effects_1;
@use '@new-ui/reset' as reset_2;
@use '@new-ui/spacings' as spacings_3;
@use '@new-ui/typography' as typography_4;`,
          includePaths: ['node_modules/@new-ui']
        }
      }
    }
  });
  