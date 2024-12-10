#!/usr/bin/env node
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { program } from 'commander';
import fsExtra from 'fs-extra';

const { ensureDirSync, writeFileSync, writeJsonSync } = fsExtra;

// New UI foundations
const dependencies = {
  colors: "@new-ui/colors@latest",
  effects: "@new-ui/effects@latest",
  reset: "@new-ui/reset@latest",
  spacings: "@new-ui/spacings@latest",
  typography: "@new-ui/typography@latest"
};

async function createNewUI() {
  console.log(chalk.blue("Create New UI"));

  // Prompt for project name
  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      default: "new-ui-app"
    }
  ]);

  // Prompt for dependencies
  const { selectedDependencies } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedDependencies",
      message: "Install New UI foundations:",
      choices: Object.keys(dependencies).map((e) => ({
        name: e,
        checked: true
      }))
    }
  ]);

  // Create project directory
  const projectPath = path.resolve(process.cwd(), projectName);
  ensureDirSync(projectPath);
  process.chdir(projectPath);

  // Create src directory structure
  const srcPath = path.join(projectPath, "src");
  ensureDirSync(srcPath);
  ensureDirSync(path.join(srcPath, "scss"));
  ensureDirSync(path.join(srcPath, "css"));

  // Create index.html
  writeFileSync(path.join(projectPath, "index.html"), `<!DOCTYPE html>
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
  writeFileSync(path.join(srcPath, "main.js"), `
console.log('New UI app initialized');
`);

  // Create package.json
  const packageJson = {
    name: projectName,
    version: "0.0.1",
    description: "New UI app.",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {},
    devDependencies: {
      vite: "latest",
      "sass-embedded": "latest",
      ...Object.fromEntries(selectedDependencies.map((e) => [`@new-ui/${e}`, "latest"]))
    }
  };

  // Write package.json
  writeJsonSync(path.join(projectPath, "package.json"), packageJson, { spaces: 2 });

  // Create vite.config.js
  writeFileSync(path.join(projectPath, "vite.config.js"), `import { defineConfig } from 'vite';
  
  export default defineConfig({
  plugins: [],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: \`${selectedDependencies.map((e, c) => `@use '@new-ui/${e}' as ${e}_${c};`).join('\n')}\`,
        includePaths: ['node_modules/@new-ui']
      }
    }
  }
});`);

  // Create initial SCSS files
  const scssPath = path.join(srcPath, "scss", "main.scss");
  const uniqueDependencies = [...new Set(selectedDependencies)];

  const dependencyMap = {
    colors: "colors",
    effects: "effects",
    reset: "reset",
    spacings: "spacings",
    typography: "typography"
  };

  const scssImports = uniqueDependencies.map((e) => {
    const c = dependencyMap[e] || e;
    return `@use '@new-ui/${e}' as ${c};`;
  }).join('\n');

  writeFileSync(scssPath, `${scssImports}
:root {
  font-size: 16px;
}
body {
  background: var(--background);
  color: var(--text-primary);
  font-family: var(--system-ui);
  font-size: var(--desktop-body-xl);
  line-height: var(--lh-desktop-body-xl);
}`.trim());

  // Create README
  writeFileSync(path.join(projectPath, "README.md"), `# ${projectName}
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
\`\`\``.trim());

  console.log(chalk.green("✓ Created successfully!"));
  console.log(chalk.blue(`cd ${projectName} && pnpm i`));
}

// CLI Configuration
if (import.meta.url === `file://${process.argv[1]}`) {
  program
    .name('create-new-ui')
    .description('Create a New UI app')
    .action(async () => {
      try {
        await createNewUI();
      } catch (error) {
        console.error(chalk.red('Error creating New UI app:'), error);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

