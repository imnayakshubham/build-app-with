/**
 * Package manager utilities for dependency management
 */

import { execa } from 'execa';
import { logger } from './logger.js';
import { DependencyError } from './error-handler.js';
import { secureExec, validatePackageName } from '../utils/secure-exec.js';

export class PackageManager {
    constructor(manager = 'npm') {
        this.manager = manager;
        this.commands = {
            npm: {
                install: ['npm', 'install'],
                add: ['npm', 'install'],
                addDev: ['npm', 'install', '--save-dev'],
                remove: ['npm', 'uninstall'],
                view: ['npm', 'view']
            },
            yarn: {
                install: ['yarn', 'install'],
                add: ['yarn', 'add'],
                addDev: ['yarn', 'add', '--dev'],
                remove: ['yarn', 'remove'],
                view: ['yarn', 'info']
            },
            pnpm: {
                install: ['pnpm', 'install'],
                add: ['pnpm', 'add'],
                addDev: ['pnpm', 'add', '--save-dev'],
                remove: ['pnpm', 'remove'],
                view: ['pnpm', 'info']
            }
        };
    }

    async getLatestVersion(packageName) {
        try {
            // Validate package name first
            if (!validatePackageName(packageName)) {
                logger.warning(`Invalid package name: ${packageName}, using "latest" tag instead.`);
                return 'latest';
            }

            const command = this.commands[this.manager].view;
            const { stdout } = await secureExec(command[0], [...command.slice(1), packageName, 'version'], {
                timeout: 30000 // 30 seconds for version check
            });
            return stdout.trim();
        } catch (error) {
            logger.warning(`Could not fetch version for ${packageName}, using "latest" tag instead.`);
            return 'latest';
        }
    }

    async installDependencies(projectPath, packages = []) {
        if (packages.length === 0) {
            return this.runCommand(projectPath, this.commands[this.manager].install);
        }

        const deps = packages.filter(pkg => !pkg.dev);
        const devDeps = packages.filter(pkg => pkg.dev);

        const commands = [];

        if (deps.length > 0) {
            commands.push([...this.commands[this.manager].add, ...deps.map(pkg => `${pkg.name}@${pkg.version}`)]);
        }

        if (devDeps.length > 0) {
            commands.push([...this.commands[this.manager].addDev, ...devDeps.map(pkg => `${pkg.name}@${pkg.version}`)]);
        }

        for (const command of commands) {
            await this.runCommand(projectPath, command);
        }
    }

    async runCommand(projectPath, command) {
        try {
            // Validate all package names in the command
            const args = command.slice(1);
            for (const arg of args) {
                if (!arg.startsWith('-') && !['install', 'add', 'remove', 'list', 'view', 'info'].includes(arg)) {
                    const packageName = arg.split('@')[0]; // Remove version specifier
                    if (!validatePackageName(packageName)) {
                        throw new DependencyError(`Invalid package name: ${packageName}`);
                    }
                }
            }

            await secureExec(command[0], command.slice(1), {
                cwd: projectPath,
                stdio: 'pipe',
                timeout: 300000, // 5 minutes timeout
                nodeEnv: 'production'
            });
        } catch (error) {
            throw new DependencyError(
                `Failed to run ${command[0]}: ${error.message}`,
                command[0]
            );
        }
    }

    async checkIfInstalled(packageName) {
        try {
            // Validate package name first
            if (!validatePackageName(packageName)) {
                return false;
            }

            await secureExec(this.manager, ['list', packageName], {
                stdio: 'pipe',
                timeout: 30000 // 30 seconds for package check
            });
            return true;
        } catch {
            return false;
        }
    }

    async detectPackageManager(projectPath) {
        const fs = await import('fs-extra');

        if (await fs.pathExists(`${projectPath}/yarn.lock`)) {
            return 'yarn';
        } else if (await fs.pathExists(`${projectPath}/pnpm-lock.yaml`)) {
            return 'pnpm';
        } else {
            return 'npm';
        }
    }
}

export const packageManager = new PackageManager();
