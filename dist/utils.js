import { outro } from '@clack/prompts';
import colors from 'picocolors';
/**
 * Sets up exit handlers for the process
 */
export function setupExitHandlers() {
    process.on('SIGINT', () => {
        console.log('\n');
        outro(colors.yellow('Setup cancelled. Goodbye!'));
        process.exit(0);
    });
}
/**
 * Displays the final success message after project creation
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
export function displaySuccessMessage(config, projectDir) {
    outro(colors.green(`
✅ Your New UI project is ready!

To get started:
  cd ${config.name}
  npm install
  npm run dev
    `));
}
/**
 * Handles error display with helpful messages
 * @param error - The error that occurred
 */
export function handleError(error) {
    console.error(colors.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    // Provide more helpful error messages
    if (error instanceof Error && error.message && error.message.includes('Permission denied')) {
        console.log(colors.yellow('\nTry running the command with higher privileges or in a directory where you have write permissions.'));
    }
    process.exit(1);
}
/**
 * Completes the project setup
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
export async function completeSetup(config, projectDir) {
    // Just display the success message with instructions to install dependencies manually
    displaySuccessMessage(config, projectDir);
}
