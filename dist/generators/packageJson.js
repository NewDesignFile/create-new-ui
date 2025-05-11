import { join } from 'path';
import { FRAMEWORKS, BUNDLERS } from '../config.js';
import { writeToFile } from '../fileSystem.js';
/**
 * Generates the package.json file
 * @param config - Project configuration
 * @param projectDir - Project directory path
 */
export async function generatePackageJson(config, projectDir) {
    const dependencies = {};
    const devDependencies = {};
    // Add New UI dependencies with their specific versions
    config.dependencies.forEach((dep) => {
        switch (dep) {
            case 'colors':
                dependencies['@new-ui/colors'] = '^2.0.1';
                break;
            case 'effects':
                dependencies['@new-ui/effects'] = '^0.1.5';
                break;
            case 'reset':
                dependencies['@new-ui/reset'] = '^0.0.9';
                break;
            case 'spacings':
                dependencies['@new-ui/spacings'] = '^0.1.5';
                break;
            case 'typography':
                dependencies['@new-ui/typography'] = '^0.1.8';
                break;
            default:
                dependencies[`@new-ui/${dep}`] = '^0.1.0'; // Fallback for any new packages
        }
    });
    // Add framework dependencies
    if (config.framework && config.framework !== FRAMEWORKS.NONE) {
        if (config.framework === FRAMEWORKS.REACT) {
            dependencies['react'] = '^18.2.0';
            dependencies['react-dom'] = '^18.2.0';
            devDependencies['@types/react'] = '^18.2.0';
            devDependencies['@types/react-dom'] = '^18.2.0';
        }
        else if (config.framework === FRAMEWORKS.VUE) {
            dependencies['vue'] = '^3.4.0';
        }
        else if (config.framework === FRAMEWORKS.SVELTE) {
            dependencies['svelte'] = '^4.2.0';
        }
    }
    // Add bundler dependencies
    if (config.bundler === BUNDLERS.VITE) {
        devDependencies['vite'] = '^5.0.0';
        // Add framework-specific plugins for Vite
        if (config.framework === FRAMEWORKS.REACT) {
            devDependencies['@vitejs/plugin-react'] = '^4.2.0';
        }
        else if (config.framework === FRAMEWORKS.VUE) {
            devDependencies['@vitejs/plugin-vue'] = '^5.0.0';
        }
        else if (config.framework === FRAMEWORKS.SVELTE) {
            devDependencies['@sveltejs/vite-plugin-svelte'] = '^3.0.0';
        }
    }
    else if (config.bundler === BUNDLERS.RSPACK) {
        devDependencies['@rspack/cli'] = '^0.5.0';
        devDependencies['@rspack/core'] = '^0.5.0';
        // Add framework-specific plugins for Rspack
        if (config.framework === FRAMEWORKS.REACT) {
            devDependencies['@rspack/plugin-react-refresh'] = '^0.5.0';
        }
    }
    // Always add TypeScript
    devDependencies['typescript'] = '^5.3.0';
    // Create scripts based on bundler
    const scripts = {
        dev: 'echo "No bundler configured"',
        build: 'echo "No bundler configured"',
    };
    if (config.bundler === BUNDLERS.VITE) {
        scripts.dev = 'vite';
        scripts.build = 'vite build';
    }
    else if (config.bundler === BUNDLERS.RSPACK) {
        scripts.dev = 'rspack serve';
        scripts.build = 'rspack build';
    }
    const packageJson = {
        name: config.name,
        version: '0.1.0',
        private: true,
        scripts,
        dependencies,
        devDependencies,
    };
    await writeToFile(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}
