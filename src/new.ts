#!/usr/bin/env node
import {
  intro,
  outro,
  text,
  select,
  multiselect,
  confirm,
  spinner,
  isCancel,
} from '@clack/prompts';
import { mkdir, writeFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as colors from 'picocolors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { constants } from 'fs';

const execAsync = promisify(exec);

// Interface for project configuration
interface ProjectConfig {
  name: string;
  dependencies: string[];
  framework: string;
  bundler: string;
}

// Function to create project directory
async function createProjectDir(projectName: string): Promise<string> {
  const projectDir = join(process.cwd(), projectName);

  if (existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists!`);
  }

  try {
    // Check if we have write permissions to the parent directory
    await access(process.cwd(), constants.W_OK);
    await mkdir(projectDir);
    return projectDir;
  } catch (error: any) {
    if (error.code === 'EACCES') {
      throw new Error(
        `Permission denied: Cannot create directory ${projectName}. Try running with higher privileges.`
      );
    }
    throw error;
  }
}

// Function to generate the README.md
async function generateReadme(config: ProjectConfig, projectDir: string): Promise<void> {
  const readmeContent = `# ${config.name}

A frontend project created with create-new-ui-app.

## Technologies
- Framework: ${config.framework || 'None'}
- Bundler: ${config.bundler || 'None'}
- UI Components: New UI

## Dependencies
${config.dependencies.map(dep => `- ${dep}`).join('\n')}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`
`;

  await writeFile(join(projectDir, 'README.md'), readmeContent);
}

// Function to generate package.json
async function generatePackageJson(config: ProjectConfig, projectDir: string): Promise<void> {
  const dependencies: Record<string, string> = {};

  // Add New UI dependencies
  config.dependencies.forEach(dep => {
    const depName = dep;
    dependencies[`@new-ui/${depName}`] = '^0.1.0'; // Using a specific version range instead of latest
  });

  // Add framework dependency if selected
  if (config.framework && config.framework !== 'None') {
    if (config.framework === 'React') {
      dependencies['react'] = '^18.2.0';
      dependencies['react-dom'] = '^18.2.0';
      dependencies['@types/react'] = '^18.2.0';
      dependencies['@types/react-dom'] = '^18.2.0';
    } else if (config.framework === 'Vue') {
      dependencies['vue'] = '^3.3.0';
    } else if (config.framework === 'Svelte') {
      dependencies['svelte'] = '^4.0.0';
    }
  }

  // Add dev dependencies based on bundler
  const devDependencies: Record<string, string> = {};
  if (config.bundler === 'vite') {
    devDependencies['vite'] = '^4.5.0';
    if (config.framework === 'React') {
      devDependencies['@vitejs/plugin-react'] = '^4.0.0';
    } else if (config.framework === 'Vue') {
      devDependencies['@vitejs/plugin-vue'] = '^4.2.0';
    } else if (config.framework === 'Svelte') {
      devDependencies['@sveltejs/vite-plugin-svelte'] = '^2.4.0';
    }
  } else if (config.bundler === 'rspack') {
    devDependencies['@rspack/cli'] = '^0.3.0';
    devDependencies['@rspack/core'] = '^0.3.0';

    // Add framework-specific rspack plugins
    if (config.framework === 'React') {
      devDependencies['@rspack/plugin-react-refresh'] = '^0.3.0';
    }
  }

  // Always add TypeScript for type support
  devDependencies['typescript'] = '^5.0.0';

  const packageJson = {
    name: config.name,
    version: '0.1.0',
    private: true,
    scripts: {
      dev:
        config.bundler === 'vite'
          ? 'vite'
          : config.bundler === 'rspack'
            ? 'rspack serve'
            : 'echo "No bundler configured"',
      build:
        config.bundler === 'vite'
          ? 'vite build'
          : config.bundler === 'rspack'
            ? 'rspack build'
            : 'echo "No bundler configured"',
    },
    dependencies,
    devDependencies,
  };

  await writeFile(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}

// Function to generate HTML template
async function generateHtmlTemplate(config: ProjectConfig, projectDir: string): Promise<void> {
  const htmlContent = `<!DOCTYPE html>
<html data-new-ui-theme="light" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  ${config.dependencies.includes('reset') ? '<meta name="description" content="A project using New UI components">' : ''}
</head>
<body>
  <div id="app">
    <!-- Content will be loaded by JavaScript -->
  </div>
  ${
    config.framework === 'React'
      ? '<script type="module" src="/src/main.tsx"></script>'
      : config.framework === 'Vue'
        ? '<script type="module" src="/src/main.ts"></script>'
        : config.framework === 'Svelte'
          ? '<script type="module" src="/src/main.ts"></script>'
          : '<script type="module" src="/src/main.ts"></script>'
  }
</body>
</html>`;

  try {
    // Create public directory if it doesn't exist
    await mkdir(join(projectDir, 'public'), { recursive: true });

    // Write HTML file
    await writeFile(join(projectDir, 'index.html'), htmlContent);
  } catch (error: any) {
    if (error.code === 'EACCES') {
      throw new Error(
        `Permission denied: Cannot write to index.html. Try running with higher privileges.`
      );
    }
    throw error;
  }
}

// Function to generate framework specific files
async function generateFrameworkFiles(config: ProjectConfig, projectDir: string): Promise<void> {
  try {
    await mkdir(join(projectDir, 'src'), { recursive: true });
  } catch (error: any) {
    if (error.code === 'EACCES') {
      throw new Error(
        `Permission denied: Cannot create src directory. Try running with higher privileges.`
      );
    }
    throw error;
  }

  if (config.framework === 'React') {
    // Create main.tsx
    const mainTsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${config.dependencies.includes('reset') ? "import '@new-ui/reset';" : ''}
${config.dependencies.includes('colors') ? "import '@new-ui/colors';" : ''}
${config.dependencies.includes('typography') ? "import '@new-ui/typography';" : ''}
${config.dependencies.includes('spacings') ? "import '@new-ui/spacings';" : ''}
${config.dependencies.includes('effects') ? "import '@new-ui/effects';" : ''}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    await writeFile(join(projectDir, 'src', 'main.tsx'), mainTsxContent);

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

    await writeFile(join(projectDir, 'src', 'App.tsx'), appTsxContent);

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

    await writeFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

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

    await writeFile(
      join(projectDir, 'tsconfig.node.json'),
      JSON.stringify(tsconfigNodeContent, null, 2)
    );

    // Create vite.config.ts if vite is selected
    if (config.bundler === 'vite') {
      const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;

      await writeFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
  } else if (config.framework === 'Vue') {
    // Create Vue version
    const mainTsContent = `import { createApp } from 'vue';
import App from './App.vue';
${config.dependencies.includes('reset') ? "import '@new-ui/reset';" : ''}
${config.dependencies.includes('colors') ? "import '@new-ui/colors';" : ''}
${config.dependencies.includes('typography') ? "import '@new-ui/typography';" : ''}
${config.dependencies.includes('spacings') ? "import '@new-ui/spacings';" : ''}
${config.dependencies.includes('effects') ? "import '@new-ui/effects';" : ''}

createApp(App).mount('#app');`;

    await writeFile(join(projectDir, 'src', 'main.ts'), mainTsContent);

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

    await writeFile(join(projectDir, 'src', 'App.vue'), appVueContent);

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

    await writeFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

    // Create vite.config.ts if vite is selected
    if (config.bundler === 'vite') {
      const viteConfigContent = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});`;

      await writeFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
  } else if (config.framework === 'Svelte') {
    // Create Svelte version
    const mainTsContent = `import App from './App.svelte';
${config.dependencies.includes('reset') ? "import '@new-ui/reset';" : ''}
${config.dependencies.includes('colors') ? "import '@new-ui/colors';" : ''}
${config.dependencies.includes('typography') ? "import '@new-ui/typography';" : ''}
${config.dependencies.includes('spacings') ? "import '@new-ui/spacings';" : ''}
${config.dependencies.includes('effects') ? "import '@new-ui/effects';" : ''}

const app = new App({
  target: document.getElementById('app')
});

export default app;`;

    await writeFile(join(projectDir, 'src', 'main.ts'), mainTsContent);

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

    await writeFile(join(projectDir, 'src', 'App.svelte'), appSvelteContent);

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
      },
      include: ['src/**/*.d.ts', 'src/**/*.ts', 'src/**/*.js', 'src/**/*.svelte'],
    };

    await writeFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

    // Create vite.config.ts if vite is selected
    if (config.bundler === 'vite') {
      const viteConfigContent = `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
});`;

      await writeFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
  } else {
    // Create vanilla JS/TS version
    const mainTsContent = `${config.dependencies.includes('reset') ? "import '@new-ui/reset';" : ''}
${config.dependencies.includes('colors') ? "import '@new-ui/colors';" : ''}
${config.dependencies.includes('typography') ? "import '@new-ui/typography';" : ''}
${config.dependencies.includes('spacings') ? "import '@new-ui/spacings';" : ''}
${config.dependencies.includes('effects') ? "import '@new-ui/effects';" : ''}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = \`
      <div class="container">
        <h1>Welcome to ${config.name}</h1>
        <p>Edit src/main.ts to customize this page</p>
      </div>
    \`;
  }
});`;

    await writeFile(join(projectDir, 'src', 'main.ts'), mainTsContent);

    // Create tsconfig.json for vanilla JS/TS
    const tsconfigContent = {
      compilerOptions: {
        target: 'ESNext',
        useDefineForClassFields: true,
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        resolveJsonModule: true,
        isolatedModules: true,
        esModuleInterop: true,
        lib: ['ESNext', 'DOM'],
        skipLibCheck: true,
        noEmit: true,
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts'],
    };

    await writeFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

    // Create vite.config.ts if vite is selected
    if (config.bundler === 'vite') {
      const viteConfigContent = `import { defineConfig } from 'vite';

export default defineConfig({});`;

      await writeFile(join(projectDir, 'vite.config.ts'), viteConfigContent);
    }
  }
}

// Function to check if npm is installed
async function checkNpmInstalled(): Promise<boolean> {
  try {
    await execAsync('npm --version');
    return true;
  } catch {
    return false;
  }
}

// Function to install dependencies
async function installDependencies(projectDir: string): Promise<boolean> {
  try {
    const npmInstalled = await checkNpmInstalled();
    if (!npmInstalled) {
      console.warn(
        colors.yellow('npm not found. Dependencies will not be installed automatically.')
      );
      return false;
    }

    await execAsync('npm install', { cwd: projectDir });
    return true;
  } catch (error: any) {
    if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.error(
        colors.red(
          'Network error: Failed to install dependencies. Please check your internet connection.'
        )
      );
    } else {
      console.error(colors.red(`Failed to install dependencies: ${error.message}`));
    }
    return false;
  }
}

// Handle Ctrl+C and cancellations
function handleCancel(input: unknown): boolean {
  if (isCancel(input)) {
    outro(colors.yellow('Setup cancelled. Goodbye!'));
    process.exit(0);
    return true;
  }
  return false;
}

async function main() {
  // Set up cleanup handler for Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n');
    outro(colors.yellow('Setup cancelled. Goodbye!'));
    process.exit(0);
  });

  intro(colors.cyan('Create New UI App - Setup Wizard'));

  const config: ProjectConfig = {
    name: '',
    dependencies: [],
    framework: '',
    bundler: '',
  };

  // Step 1: Project name
  const projectName = await text({
    message: 'What is your project name?',
    placeholder: 'my-new-ui-app',
    validate: value => {
      if (!value) return 'Project name is required';
      if (existsSync(join(process.cwd(), value))) {
        return 'Directory already exists';
      }
      if (!/^[a-z0-9-_]+$/i.test(value)) {
        return 'Project name can only contain letters, numbers, hyphens, and underscores';
      }
      if (value.length > 214) {
        return 'Project name is too long (max 214 characters)';
      }
      return;
    },
  });

  if (handleCancel(projectName)) return;

  config.name = projectName as string;

  // Step 2: Select New UI dependencies
  const newUiDependencies = await multiselect({
    message: 'Select New UI dependencies you want to include:',
    options: [
      { value: 'reset', label: '@new-ui/reset' },
      { value: 'colors', label: '@new-ui/colors' },
      { value: 'spacings', label: '@new-ui/spacings' },
      { value: 'typography', label: '@new-ui/typography' },
      { value: 'effects', label: '@new-ui/effects' },
    ],
    required: false,
  });

  if (handleCancel(newUiDependencies)) return;

  config.dependencies = newUiDependencies as string[];

  // Show warning if no dependencies selected
  if (config.dependencies.length === 0) {
    const continueDespiteNoDeps = await confirm({
      message: 'No New UI dependencies selected. Are you sure you want to continue?',
    });

    if (handleCancel(continueDespiteNoDeps)) return;
    if (!continueDespiteNoDeps) {
      return main(); // Restart the wizard
    }
  }

  // Step 3: Select framework
  const includeFramework = await confirm({
    message: 'Do you want to include a frontend framework?',
  });

  if (handleCancel(includeFramework)) return;

  if (includeFramework) {
    const framework = await select({
      message: 'Select a frontend framework:',
      options: [
        { value: 'React', label: 'React' },
        { value: 'Vue', label: 'Vue' },
        { value: 'Svelte', label: 'Svelte' },
        { value: 'None', label: 'None' },
      ],
    });

    if (handleCancel(framework)) return;
    config.framework = framework as string;
  } else {
    config.framework = 'None';
  }

  // Step 4: Select bundler
  const includeBundler = await confirm({
    message: 'Do you want to include a bundler?',
  });

  if (handleCancel(includeBundler)) return;

  if (includeBundler) {
    const bundlerOptions = [
      { value: 'vite', label: 'Vite' },
      { value: 'rspack', label: 'Rspack' },
      { value: 'None', label: 'None' },
    ];

    // Filter out incompatible bundlers
    if (config.framework === 'Svelte') {
      // Remove rspack as it doesn't have great Svelte support
      const filteredOptions = bundlerOptions.filter(option => option.value !== 'rspack');
      console.log(
        colors.yellow(
          'Note: Rspack is not fully compatible with Svelte. Only Vite is recommended for Svelte projects.'
        )
      );

      const bundler = await select({
        message: 'Select a bundler:',
        options: filteredOptions,
      });

      if (handleCancel(bundler)) return;
      config.bundler = bundler as string;
    } else {
      const bundler = await select({
        message: 'Select a bundler:',
        options: bundlerOptions,
      });

      if (handleCancel(bundler)) return;
      config.bundler = bundler as string;
    }
  } else {
    config.bundler = 'None';
  }

  // Step 5: Show summary and ask for confirmation
  console.log('\n' + colors.cyan('Project Summary:'));
  console.log(`  Name: ${colors.white(config.name)}`);
  console.log(
    `  New UI Dependencies: ${
      config.dependencies.length > 0
        ? colors.white(config.dependencies.join(', '))
        : colors.yellow('None')
    }`
  );
  console.log(`  Framework: ${colors.white(config.framework)}`);
  console.log(`  Bundler: ${colors.white(config.bundler)}`);

  const confirmed = await confirm({
    message: 'Create project with these settings?',
  });

  if (handleCancel(confirmed)) return;
  if (!confirmed) {
    outro(colors.yellow('Project creation cancelled. Run the command again to start over.'));
    return;
  }

  // Step 6: Create the project
  const s = spinner();
  s.start('Creating your project');

  try {
    // Create project directory
    const projectDir = await createProjectDir(config.name);

    // Generate project files
    s.message('Generating project files...');
    await generateReadme(config, projectDir);
    await generatePackageJson(config, projectDir);
    await generateHtmlTemplate(config, projectDir);
    await generateFrameworkFiles(config, projectDir);

    s.stop('Project structure created');

    // Install dependencies
    s.start('Installing dependencies (this may take a moment)');
    const installSuccessful = await installDependencies(projectDir);

    if (installSuccessful) {
      s.stop('Dependencies installed successfully');
    } else {
      s.stop('Project created but dependencies could not be installed automatically');
      console.log(colors.yellow('\nTo install dependencies manually:'));
      console.log(`  cd ${config.name}`);
      console.log('  npm install');
    }

    outro(
      colors.green(`
✅ Your New UI project is ready!

To get started:
  cd ${config.name}
  ${installSuccessful ? 'npm run dev' : 'npm install && npm run dev'}
      `)
    );
  } catch (error: any) {
    s.stop(`Error: ${error instanceof Error ? error.message : String(error)}`);

    // Provide more helpful error messages
    if (error.message.includes('Permission denied')) {
      console.log(
        colors.yellow(
          '\nTry running the command with higher privileges or in a directory where you have write permissions.'
        )
      );
    }

    process.exit(1);
  }
}

main().catch(console.error);
