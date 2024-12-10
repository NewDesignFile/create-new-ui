#!/usr/bin/env node
"use strict";

var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _path = _interopRequireDefault(require("path"));
var _url = require("url");
var _inquirer = _interopRequireDefault(require("inquirer"));
var _chalk = _interopRequireDefault(require("chalk"));
var _commander = require("commander");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Available dependencies
const DEPENDENCIES = {
  colors: '@new-ui/colors@latest',
  effects: '@new-ui/effects@latest',
  reset: '@new-ui/reset@latest',
  spacings: '@new-ui/spacings@latest',
  typography: '@new-ui/typography@latest'
};
async function createNewUI() {
  console.log(_chalk.default.blue('Create New UI'));

  // Prompt for project name
  const {
    projectName
  } = await _inquirer.default.prompt([{
    type: 'input',
    name: 'projectName',
    message: 'What is your project name?',
    default: 'new-ui-app'
  }]);

  // Prompt for dependencies
  const {
    selectedDependencies
  } = await _inquirer.default.prompt([{
    type: 'checkbox',
    name: 'selectedDependencies',
    message: 'Install New UI foundations:',
    choices: Object.keys(DEPENDENCIES).map(dep => ({
      name: dep,
      checked: true
    }))
  }]);

  // Create project directory
  const projectPath = _path.default.resolve(process.cwd(), projectName);
  _fsExtra.default.ensureDirSync(projectPath);
  process.chdir(projectPath);

  // Create src directory structure
  const srcPath = _path.default.join(projectPath, 'src');
  _fsExtra.default.ensureDirSync(srcPath);
  _fsExtra.default.ensureDirSync(_path.default.join(srcPath, 'scss'));
  _fsExtra.default.ensureDirSync(_path.default.join(srcPath, 'css'));

  // Create index.html
  _fsExtra.default.writeFileSync(_path.default.join(projectPath, 'index.html'), `<!DOCTYPE html>
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
  _fsExtra.default.writeFileSync(_path.default.join(srcPath, 'main.js'), `// Main entry point for the application
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
  _fsExtra.default.writeJsonSync(_path.default.join(projectPath, 'package.json'), packageJson, {
    spaces: 2
  });

  // Create vite.config.js
  _fsExtra.default.writeFileSync(_path.default.join(projectPath, 'vite.config.js'), `import { defineConfig } from 'vite';
  
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
  const mainScssPath = _path.default.join(srcPath, 'scss', 'main.scss');
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
  _fsExtra.default.writeFileSync(mainScssPath, `${scssImports}

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
  _fsExtra.default.writeFileSync(_path.default.join(projectPath, 'README.md'), `# ${projectName}
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
  console.log(_chalk.default.green('✓ Created successfully!'));
  console.log(_chalk.default.blue(`cd ${projectName} && pnpm i`));
}

// CLI Configuration
_commander.program.name('create-new-ui').description('Create a New UI app').action(createNewUI);
_commander.program.parse(process.argv);