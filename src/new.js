#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { program } from 'commander';

// Available dependencies
const DEPENDENCIES = {
  colors: '@new-ui/colors@latest',
  effects: '@new-ui/effects@latest',
  reset: '@new-ui/reset@latest',
  spacings: '@new-ui/spacings@latest',
  typography: '@new-ui/typography@latest'
};

async function createNewUI() {
  console.log(chalk.blue('Create New UI'));

  // Prompt for project name
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      default: 'new-ui-app'
    }
  ]);

  // Prompt for dependencies
  const { selectedDependencies } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedDependencies',
      message: 'Install New UI foundations:',
      choices: Object.keys(DEPENDENCIES).map(dep => ({
        name: dep,
        checked: true
      }))
    }
  ]);

  // Create project directory
  const projectPath = path.resolve(process.cwd(), projectName);
  fs.ensureDirSync(projectPath);
  process.chdir(projectPath);

  // Create src directory structure
  const srcPath = path.join(projectPath, 'src');
  fs.ensureDirSync(srcPath);
  fs.ensureDirSync(path.join(srcPath, 'scss'));
  fs.ensureDirSync(path.join(srcPath, 'css'));

  // Create index.html
  fs.writeFileSync(path.join(projectPath, 'index.html'), `<!DOCTYPE html>
<html lang="en" data-new-ui-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="/src/scss/main.scss">
</head>
<body>
    <div id="app">
        <h1>Welcome to ${projectName}</h1>
    </div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>`);

  // Create main.js
  fs.writeFileSync(path.join(srcPath, 'main.js'), `// Main entry point for the application
console.log('New UI application initialized');
`);

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '0.0.1',
    description: 'New UI app.',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {},
    devDependencies: {
      'vite': 'latest',
      'sass-embedded': 'latest',
      '@new-ui/colors': 'latest',
      '@new-ui/effects': 'latest',
      '@new-ui/reset': 'latest',
      '@new-ui/spacings': 'latest',
      '@new-ui/typography': 'latest'
    }
  };

  // Add selected dependencies
  selectedDependencies.forEach(dep => {
    delete packageJson.dependencies[dep];
  });

  // Write package.json
  fs.writeJsonSync(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create vite.config.js
  fs.writeFileSync(path.join(projectPath, 'vite.config.js'), `import { defineConfig } from 'vite';
  
  export default defineConfig({
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: \`${selectedDependencies.map((dep, index) => `@use '@new-ui/${dep}' as ${dep}_${index};`).join('\n')}\`,
          includePaths: ['node_modules/@new-ui']
        }
      }
    }
  });
  `);

// Create initial SCSS files
const mainScssPath = path.join(srcPath, 'scss', 'main.scss');
const uniqueDependencies = [...new Set(selectedDependencies)];

const namespaces = {
  colors: 'colors',
  effects: 'effects',
  reset: 'reset',
  spacings: 'spacings',
  typography: 'typography'
};

const scssImports = uniqueDependencies.map(dep => {
  const namespace = namespaces[dep] || dep;
  return `@use '@new-ui/${dep}' as ${namespace};`;
}).join('\n');

fs.writeFileSync(mainScssPath, 
  `${scssImports}

:root {
  font-size: 16px;
}

body {
  background: var(--background);
  color: var(--text-primary);
  font-family: var(--system-ui);
  font-size: var(--desktop-body-xl);
  line-height: var(--lh-desktop-body-xl);
}
`.trim());

  // Create README
  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${projectName}
New UI app

## Getting Started
1. Install dependencies:
\`\`\`bash
pnpm i
\`\`\`

2. Run development server:
\`\`\`bash
pnpm run dev
\`\`\`

3. Build for production:
\`\`\`bash
pnpm run build
\`\`\`

4. Preview production build:
\`\`\`bash
pnpm run preview
\`\`\`
`.trim());

  console.log(chalk.green('✓ Created successfully!'));
  console.log(chalk.blue(`cd ${projectName} && pnpm i`));
}

// CLI Configuration
program
  .name('create-new-ui')
  .description('Create a New UI app')
  .action(createNewUI);

program.parse(process.argv);