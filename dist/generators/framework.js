import { join } from 'path';
import { FRAMEWORKS, BUNDLERS } from '../config.js';
import { writeToFile, ensureDir } from '../fileSystem.js';
/**
 * Generates framework-specific files
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
export async function generateFrameworkFiles(config, projectDir) {
    // Create src directory
    await ensureDir(join(projectDir, 'src'));
    // Generate files based on framework
    switch (config.framework) {
        case FRAMEWORKS.REACT:
            await generateReactFiles(config, projectDir);
            break;
        case FRAMEWORKS.VUE:
            await generateVueFiles(config, projectDir);
            break;
        case FRAMEWORKS.SVELTE:
            await generateSvelteFiles(config, projectDir);
            break;
        default:
            await generateVanillaFiles(config, projectDir);
            break;
    }
}
/**
 * Creates import statements for New UI dependencies
 * @param config - Project configuration
 * @returns String with import statements
 */
function createDependencyImports(config) {
    const imports = [];
    if (config.dependencies.includes('reset'))
        imports.push("import '@new-ui/reset';");
    if (config.dependencies.includes('colors'))
        imports.push("import '@new-ui/colors';");
    if (config.dependencies.includes('typography'))
        imports.push("import '@new-ui/typography';");
    if (config.dependencies.includes('spacings'))
        imports.push("import '@new-ui/spacings';");
    if (config.dependencies.includes('effects'))
        imports.push("import '@new-ui/effects';");
    return imports.join('\n');
}
/**
 * Generates React-specific files
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
async function generateReactFiles(config, projectDir) {
    // Create main.tsx
    const mainTsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${createDependencyImports(config)}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    await writeToFile(join(projectDir, 'src', 'main.tsx'), mainTsxContent);
    // Create App.tsx
    const appTsxContent = `import React from 'react';

function App() {
  return (
    <div className="container">
      <h1>Welcome to ${config.name}</h1>
      <p>Edit src/App.tsx to customize this page</p>
    </div>
  );
}

export default App;`;
    await writeToFile(join(projectDir, 'src', 'App.tsx'), appTsxContent);
    // Create tsconfig.json
    const tsconfigContent = {
        compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
    };
    await writeToFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
    // Create tsconfig.node.json
    const tsconfigNodeContent = {
        compilerOptions: {
            composite: true,
            skipLibCheck: true,
            module: 'ESNext',
            moduleResolution: 'bundler',
            allowSyntheticDefaultImports: true,
        },
        include: ['vite.config.ts'],
    };
    await writeToFile(join(projectDir, 'tsconfig.node.json'), JSON.stringify(tsconfigNodeContent, null, 2));
    // Create bundler config if needed
    if (config.bundler === BUNDLERS.VITE) {
        const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;
        await writeToFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
}
/**
 * Generates Vue-specific files
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
async function generateVueFiles(config, projectDir) {
    // Create main.ts
    const mainTsContent = `import { createApp } from 'vue';
import App from './App.vue';
${createDependencyImports(config)}

createApp(App).mount('#app');`;
    await writeToFile(join(projectDir, 'src', 'main.ts'), mainTsContent);
    // Create App.vue
    const appVueContent = `<template>
  <div class="container">
    <h1>Welcome to ${config.name}</h1>
    <p>Edit src/App.vue to customize this page</p>
  </div>
</template>

<script setup lang="ts">
// Your component logic here
</script>

<style>
/* Your styles here */
</style>`;
    await writeToFile(join(projectDir, 'src', 'App.vue'), appVueContent);
    // Create tsconfig.json
    const tsconfigContent = {
        compilerOptions: {
            target: 'ESNext',
            useDefineForClassFields: true,
            module: 'ESNext',
            moduleResolution: 'node',
            strict: true,
            jsx: 'preserve',
            resolveJsonModule: true,
            isolatedModules: true,
            esModuleInterop: true,
            lib: ['ESNext', 'DOM'],
            skipLibCheck: true,
            noEmit: true,
        },
        include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
    };
    await writeToFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
    // Create bundler config if needed
    if (config.bundler === BUNDLERS.VITE) {
        const viteConfigContent = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});`;
        await writeToFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
}
/**
 * Generates Svelte-specific files
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
async function generateSvelteFiles(config, projectDir) {
    // Create main.ts
    const mainTsContent = `import App from './App.svelte';
${createDependencyImports(config)}

const app = new App({
  target: document.getElementById('app')
});

export default app;`;
    await writeToFile(join(projectDir, 'src', 'main.ts'), mainTsContent);
    // Create App.svelte
    const appSvelteContent = `<script lang="ts">
  // Your component logic here
</script>

<div class="container">
  <h1>Welcome to ${config.name}</h1>
  <p>Edit src/App.svelte to customize this page</p>
</div>

<style>
  /* Your styles here */
</style>`;
    await writeToFile(join(projectDir, 'src', 'App.svelte'), appSvelteContent);
    // Create tsconfig.json
    const tsconfigContent = {
        extends: '@tsconfig/svelte/tsconfig.json',
        compilerOptions: {
            target: 'ESNext',
            useDefineForClassFields: true,
            module: 'ESNext',
            resolveJsonModule: true,
            allowJs: true,
            checkJs: true,
            isolatedModules: true,
            strict: true,
        },
        include: ['src/**/*.d.ts', 'src/**/*.ts', 'src/**/*.js', 'src/**/*.svelte'],
    };
    await writeToFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
    // Create svelte.config.js
    const svelteConfigContent = `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
};`;
    await writeToFile(join(projectDir, 'svelte.config.js'), svelteConfigContent);
    // Create bundler config if needed
    if (config.bundler === BUNDLERS.VITE) {
        const viteConfigContent = `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
});`;
        await writeToFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
}
/**
 * Generates vanilla JS/TS files
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
async function generateVanillaFiles(config, projectDir) {
    // Create main.ts
    const mainTsContent = `${createDependencyImports(config)}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = \`
      <div class="container">
        <h1>Welcome to ${config.name}</h1>
        <p>Edit src/main.ts to customize this page</p>
      </div>
    \`;
  }
});`;
    await writeToFile(join(projectDir, 'src', 'main.ts'), mainTsContent);
    // Create styles.css
    const stylesContent = `/* Your styles here */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}`;
    await writeToFile(join(projectDir, 'src', 'styles.css'), stylesContent);
    // Create tsconfig.json
    const tsconfigContent = {
        compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            module: 'ESNext',
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            skipLibCheck: true,
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
    };
    await writeToFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
    // Create bundler config if needed
    if (config.bundler === BUNDLERS.VITE) {
        const viteConfigContent = `import { defineConfig } from 'vite';

export default defineConfig({
  // Vite configuration options
});`;
        await writeToFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
}
