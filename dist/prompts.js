import { existsSync } from 'fs';
import { join } from 'path';
import { intro, outro, text, select, multiselect, confirm, isCancel } from '@clack/prompts';
import colors from 'picocolors';
import { NEW_UI_DEPENDENCIES, FRAMEWORK_OPTIONS, BUNDLER_OPTIONS, FRAMEWORKS, } from './config.js';
/**
 * Handles cancellation of prompts
 * @param input - Input value from prompt
 * @returns true if the prompt was cancelled
 */
export function handleCancel(input) {
    if (isCancel(input)) {
        outro(colors.yellow('Setup cancelled. Goodbye!'));
        process.exit(0);
        return true;
    }
    return false;
}
/**
 * Collects project configuration from user
 * @returns Project configuration object
 */
export async function collectProjectConfig() {
    intro(colors.cyan('Create New UI'));
    const config = {
        name: '',
        dependencies: [],
        framework: '',
        bundler: '',
    };
    // Step 1: Project name
    const projectName = await text({
        message: 'What is your project name?',
        placeholder: 'my-project',
        validate: value => {
            if (!value)
                return 'Project name is required';
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
    if (handleCancel(projectName))
        process.exit(0);
    config.name = projectName;
    // Step 2: Select New UI dependencies
    const newUiDependencies = await multiselect({
        message: 'Select New UI foundations you want to include:',
        options: NEW_UI_DEPENDENCIES,
        required: false,
    });
    if (handleCancel(newUiDependencies))
        process.exit(0);
    config.dependencies = newUiDependencies;
    // Warning if no dependencies selected
    if (config.dependencies.length === 0) {
        const continueDespiteNoDeps = await confirm({
            message: 'No New UI foundations selected. Are you sure you want to continue?',
        });
        if (handleCancel(continueDespiteNoDeps))
            process.exit(0);
        if (!continueDespiteNoDeps) {
            return collectProjectConfig(); // Restart
        }
    }
    // Step 3: Select framework
    const includeFramework = await confirm({
        message: 'Do you want to include a frontend framework?',
    });
    if (handleCancel(includeFramework))
        process.exit(0);
    if (includeFramework) {
        const framework = await select({
            message: 'Select a frontend framework:',
            options: FRAMEWORK_OPTIONS,
        });
        if (handleCancel(framework))
            process.exit(0);
        config.framework = framework;
    }
    else {
        config.framework = 'None';
    }
    // Step 4: Select bundler
    const includeBundler = await confirm({
        message: 'Do you want to include a bundler?',
    });
    if (handleCancel(includeBundler))
        process.exit(0);
    if (includeBundler) {
        let bundlerOptions = [...BUNDLER_OPTIONS];
        // Filter out incompatible bundlers for Svelte
        if (config.framework === FRAMEWORKS.SVELTE) {
            bundlerOptions = bundlerOptions.filter(option => option.value !== 'rspack');
            console.log(colors.yellow('Note: Rspack is not fully compatible with Svelte. Only Vite is recommended for Svelte projects.'));
        }
        const bundler = await select({
            message: 'Select a bundler:',
            options: bundlerOptions,
        });
        if (handleCancel(bundler))
            process.exit(0);
        config.bundler = bundler;
    }
    else {
        config.bundler = 'None';
    }
    // Summary and confirmation
    console.log('\n' + colors.cyan('Project Summary:'));
    console.log(`  Name: ${colors.white(config.name)}`);
    console.log(`  New UI Dependencies: ${config.dependencies.length > 0
        ? colors.white(config.dependencies.join(', '))
        : colors.yellow('None')}`);
    console.log(`  Framework: ${colors.white(config.framework)}`);
    console.log(`  Bundler: ${colors.white(config.bundler)}`);
    const confirmed = await confirm({
        message: 'Create project with these settings?',
    });
    if (handleCancel(confirmed))
        process.exit(0);
    if (!confirmed) {
        outro(colors.yellow('Project creation cancelled. Run the command again to start over.'));
        process.exit(0);
    }
    return config;
}
