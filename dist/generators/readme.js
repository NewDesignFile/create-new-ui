import { join } from 'path';
import { writeToFile } from '../fileSystem.js';
/**
 * Generates the README.md file
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
export async function generateReadme(config, projectDir) {
    const readmeContent = `# ${config.name}

A frontend project created with create-new-ui-app.

## Technologies
- Framework: ${config.framework || 'None'}
- Bundler: ${config.bundler || 'None'}
- UI Components: New UI

## Dependencies
${config.dependencies.map((dep) => `- ${dep}`).join('\n')}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`
`;
    await writeToFile(join(projectDir, 'README.md'), readmeContent);
}
