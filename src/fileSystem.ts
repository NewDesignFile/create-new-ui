import { exec } from 'child_process';
import { constants, existsSync } from 'fs';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';

import colors from 'picocolors';

export const execAsync = promisify(exec);

/**
 * Creates a project directory
 * @param projectName - Name of the project (and directory)
 * @returns Path to the created directory
 */
export async function createProjectDir(projectName: string): Promise<string> {
  const projectDir = join(process.cwd(), projectName);

  if (existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists!`);
  }

  try {
    // Check for write permissions
    await access(process.cwd(), constants.W_OK);
    await mkdir(projectDir);
    return projectDir;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
      throw new Error(
        `Permission denied: Cannot create directory ${projectName}. Try running with higher privileges.`
      );
    }
    throw error;
  }
}

/**
 * Creates a directory if it doesn't exist
 * @param dir - Directory path
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
      throw new Error(`Permission denied: Cannot create directory ${dir}`);
    }
    throw error;
  }
}

/**
 * Writes content to a file
 * @param filePath - Path to the file
 * @param content - Content to write
 */
export async function writeToFile(filePath: string, content: string): Promise<void> {
  try {
    await writeFile(filePath, content);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to write to ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Checks if npm is installed
 * @returns Boolean indicating if npm is available
 */
export async function checkNpmInstalled(): Promise<boolean> {
  try {
    await execAsync('npm --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Installs dependencies in the project directory
 * @param projectDir - Path to the project directory
 * @returns Boolean indicating if installation was successful
 */
export async function installDependencies(projectDir: string): Promise<boolean> {
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
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes('network') || error.message.includes('ENOTFOUND'))
    ) {
      console.error(
        colors.red(
          'Network error: Failed to install dependencies. Please check your internet connection.'
        )
      );
    } else if (error instanceof Error) {
      console.error(colors.red(`Failed to install dependencies: ${error.message}`));
    }
    return false;
  }
}
