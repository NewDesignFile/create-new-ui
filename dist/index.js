#!/usr/bin/env node
import { collectProjectConfig } from './prompts.js';
import { createProjectDir } from './fileSystem.js';
import { generateFrameworkFiles } from './generators/framework.js';
import { generateHtmlTemplate } from './generators/html.js';
import { generatePackageJson } from './generators/packageJson.js';
import { generateReadme } from './generators/readme.js';
import { completeSetup, handleError, setupExitHandlers } from './utils.js';
// Main function to create a new UI project
async function createNewUI() {
    try {
        // Setup exit handlers for graceful termination
        setupExitHandlers();
        // Collect project configuration from user
        const config = await collectProjectConfig();
        // Create project directory
        const projectDir = await createProjectDir(config.name);
        // Generate project files
        await generatePackageJson(config, projectDir);
        await generateReadme(config, projectDir);
        await generateHtmlTemplate(config, projectDir);
        await generateFrameworkFiles(config, projectDir);
        // Complete setup by installing dependencies
        await completeSetup(config, projectDir);
    }
    catch (error) {
        handleError(error);
    }
}
// Execute the main function
createNewUI();
// Export functions for use in other modules or testing
export { collectProjectConfig, createProjectDir, generateFrameworkFiles, generateHtmlTemplate, generatePackageJson, generateReadme, completeSetup, handleError, setupExitHandlers, };
