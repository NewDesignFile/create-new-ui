import { join } from 'path';
import { FRAMEWORKS } from '../config.js';
import { writeToFile, ensureDir } from '../fileSystem.js';
/**
 * Generates the HTML template
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
export async function generateHtmlTemplate(config, projectDir) {
    // Determine script tag based on framework
    let scriptTag = '<script type="module" src="/src/main.ts"></script>';
    if (config.framework === FRAMEWORKS.REACT) {
        scriptTag = '<script type="module" src="/src/main.tsx"></script>';
    }
    const htmlContent = `<!DOCTYPE html>
<html data-new-ui-theme="light" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  ${config.dependencies.includes('reset') ? '<meta name="description" content="New UI">' : ''}
</head>
<body>
  <div id="app">
    <!-- Content will be loaded by JavaScript -->
  </div>
  ${scriptTag}
</body>
</html>`;
    // Create public directory if it doesn't exist
    await ensureDir(join(projectDir, 'public'));
    // Write HTML file
    await writeToFile(join(projectDir, 'index.html'), htmlContent);
}
