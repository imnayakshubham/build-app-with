/**
 * Fastify project structure generator
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../../core/logger.js';
import { packageManager } from '../../core/package-manager.js';
import { featurePackageMap, frameworkBasePackages } from '../../config/package-mappings.js';
import { FRAMEWORKS, FEATURES, DATABASES, AUTH_STRATEGIES } from '../../types/index.js';
import { generateSecureEnvTemplate, generateJwtSecret, generateDatabasePassword } from '../../utils/security.js';
import { generatePackageJson } from './templates/package-json.js';
import { generateAppJs } from './templates/app.js';
import { generateServerJs } from './templates/server.js';
import { generatePlugins } from './templates/plugins.js';
import { generateRoutes } from './templates/routes.js';
import { generateConfig } from './templates/config.js';
import { generateModels } from './templates/models.js';
import { generateServices } from './templates/services.js';
import { generateTests } from './templates/tests.js';
import { generateDocker } from './templates/docker.js';
import { generateReadme } from './templates/readme.js';

export async function generateFastifyProject(projectPath, answers) {
    const spinner = logger.startSpinner('Generating Fastify project structure...');

    try {
        // Generate package.json
        const packageJson = generatePackageJson(answers);
        await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

        // Generate main application files
        await generateAppJs(projectPath, answers);
        await generateServerJs(projectPath, answers);

        // Generate project structure based on choice
        switch (answers.projectStructure) {
            case 'simple':
                await generateSimpleStructure(projectPath, answers);
                break;
            case 'modular':
                await generateModularStructure(projectPath, answers);
                break;
            case 'plugin-based':
                await generatePluginBasedStructure(projectPath, answers);
                break;
        }


        // Generate database models if needed
        if (answers.database !== 'none') {
            const modelsContent = generateModels(projectPath, answers);
            await fs.ensureDir(path.join(projectPath, 'src', 'models'));
            await fs.writeFile(path.join(projectPath, 'src', 'models', 'index.js'), modelsContent);
        }

        // Generate additional files
        const pluginsContent = generatePlugins(projectPath, answers);
        const routesContent = generateRoutes(projectPath, answers);
        const configContent = generateConfig(projectPath, answers);
        const servicesContent = generateServices(projectPath, answers);

        // Write plugin files
        await fs.ensureDir(path.join(projectPath, 'src', 'plugins'));
        await fs.writeFile(path.join(projectPath, 'src', 'plugins', 'error-handler.js'), pluginsContent);

        // Write routes files
        await fs.ensureDir(path.join(projectPath, 'src', 'routes'));
        await fs.writeFile(path.join(projectPath, 'src', 'routes', 'index.js'), routesContent);

        // Write config files
        await fs.ensureDir(path.join(projectPath, 'src', 'config'));
        await fs.writeFile(path.join(projectPath, 'src', 'config', 'index.js'), configContent);

        // Write services files
        await fs.ensureDir(path.join(projectPath, 'src', 'services'));
        await fs.writeFile(path.join(projectPath, 'src', 'services', 'index.js'), servicesContent);

        // Generate tests if requested
        if (answers.includeTests) {
            const testsContent = generateTests(projectPath, answers);
            await fs.ensureDir(path.join(projectPath, 'tests'));
            await fs.writeFile(path.join(projectPath, 'tests', 'app.test.js'), testsContent);
        }

        // Generate Docker files if requested
        if (answers.includeDocker) {
            const { dockerfile, dockerCompose } = generateDocker(projectPath, answers);
            await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile);
            await fs.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerCompose);
        }

        // Generate README
        await generateReadme(projectPath, answers);

        // Generate .gitignore
        await generateGitignore(projectPath);

        // Generate .env.example
        await generateEnvExample(projectPath, answers);

        spinner.succeed('Project structure generated successfully!');

        // Skip dependency installation for now - let user install manually
        logger.info('Project structure created! Next steps:');
        logger.info(`  cd ${path.basename(projectPath)}`);
        logger.info('  npm install');
        logger.info('  npm run dev');

    } catch (error) {
        spinner.fail('Failed to generate project structure');
        throw error;
    }
}

async function generateSimpleStructure(projectPath, answers) {
    const srcDir = path.join(projectPath, 'src');
    await fs.ensureDir(srcDir);

    // Create basic structure
    await fs.ensureDir(path.join(srcDir, 'routes'));
    await fs.ensureDir(path.join(srcDir, 'plugins'));
    await fs.ensureDir(path.join(srcDir, 'utils'));
    await fs.ensureDir(path.join(srcDir, 'config'));
}

async function generateModularStructure(projectPath, answers) {
    const srcDir = path.join(projectPath, 'src');
    await fs.ensureDir(srcDir);

    // Create modular structure
    const modules = ['auth', 'users', 'api'];
    for (const module of modules) {
        await fs.ensureDir(path.join(srcDir, 'modules', module, 'routes'));
        await fs.ensureDir(path.join(srcDir, 'modules', module, 'services'));
        await fs.ensureDir(path.join(srcDir, 'modules', module, 'models'));
        await fs.ensureDir(path.join(srcDir, 'modules', module, 'plugins'));
    }

    await fs.ensureDir(path.join(srcDir, 'shared', 'plugins'));
    await fs.ensureDir(path.join(srcDir, 'shared', 'utils'));
    await fs.ensureDir(path.join(srcDir, 'shared', 'config'));
}

async function generatePluginBasedStructure(projectPath, answers) {
    const srcDir = path.join(projectPath, 'src');
    await fs.ensureDir(srcDir);

    // Create plugin-based structure
    await fs.ensureDir(path.join(srcDir, 'plugins'));
    await fs.ensureDir(path.join(srcDir, 'routes'));
    await fs.ensureDir(path.join(srcDir, 'services'));
    await fs.ensureDir(path.join(srcDir, 'models'));
    await fs.ensureDir(path.join(srcDir, 'utils'));
    await fs.ensureDir(path.join(srcDir, 'config'));
    await fs.ensureDir(path.join(srcDir, 'schemas'));
}

async function generateGitignore(projectPath) {
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build output
dist/
build/
`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
}

async function generateEnvExample(projectPath, answers) {
    const config = {
        nodeEnv: 'development',
        port: 3000,
        additionalVars: {
            HOST: '0.0.0.0'
        }
    };

    // Add database configuration if specified
    if (answers.database) {
        const dbPassword = generateDatabasePassword();

        if (answers.database === DATABASES.MONGODB) {
            config.additionalVars['MONGODB_URI'] = `mongodb://localhost:27017/${answers.projectName}`;
        } else if (answers.database === DATABASES.POSTGRESQL) {
            config.database = {
                host: 'localhost',
                port: 5432,
                name: answers.projectName,
                user: 'dbuser',
            };
            config.additionalVars['DATABASE_URL'] = `postgresql://dbuser:${dbPassword}@localhost:5432/${answers.projectName}`;
        } else if (answers.database === DATABASES.MYSQL) {
            config.database = {
                host: 'localhost',
                port: 3306,
                name: answers.projectName,
                user: 'dbuser',
            };
        } else if (answers.database === DATABASES.SQLITE) {
            config.additionalVars['DATABASE_URL'] = 'file:./dev.db';
        }
    }

    // Add JWT configuration if authentication is enabled
    if (answers.authStrategy && answers.authStrategy !== 'none') {
        config.jwt = {
            expiresIn: '7d'
        };
    }

    // Add CORS configuration if enabled
    if (answers.features.includes(FEATURES.CORS)) {
        config.additionalVars['CORS_ORIGIN'] = 'http://localhost:3000';
    }

    // Add rate limiting configuration if enabled
    if (answers.features.includes('rate-limit')) {
        config.additionalVars['RATE_LIMIT_MAX'] = '100';
        config.additionalVars['RATE_LIMIT_TIME_WINDOW'] = '60000';
    }

    // Generate secure environment template
    const envContent = generateSecureEnvTemplate(config);

    await fs.writeFile(path.join(projectPath, '.env.example'), envContent);

    // Also create a real .env file with the same secure values
    await fs.writeFile(path.join(projectPath, '.env'), envContent);

    logger.info('✅ Generated .env files with secure random secrets');
    logger.warning('⚠️  IMPORTANT: Change all default values before deploying to production!');
}

async function installDependencies(projectPath, answers) {
    const packages = [];

    // Add base Fastify packages
    const basePackages = frameworkBasePackages[FRAMEWORKS.FASTIFY];
    packages.push(...basePackages.deps.map(name => ({ name, version: 'latest', dev: false })));
    packages.push(...basePackages.devDeps.map(name => ({ name, version: 'latest', dev: true })));

    // Add database packages
    if (answers.database === DATABASES.MONGODB) {
        packages.push({ name: 'mongoose', version: 'latest', dev: false });
    } else if (answers.database === DATABASES.POSTGRESQL || answers.database === DATABASES.SQLITE) {
        packages.push({ name: '@prisma/client', version: 'latest', dev: false });
        packages.push({ name: 'prisma', version: 'latest', dev: true });
    } else if (answers.database === DATABASES.MYSQL) {
        packages.push({ name: 'sequelize', version: 'latest', dev: false });
        packages.push({ name: 'mysql2', version: 'latest', dev: false });
    }

    // Add authentication packages
    if (answers.authStrategy === AUTH_STRATEGIES.JWT) {
        packages.push({ name: 'jsonwebtoken', version: 'latest', dev: false });
        packages.push({ name: 'bcryptjs', version: 'latest', dev: false });
    } else if (answers.authStrategy === AUTH_STRATEGIES.OAUTH) {
        packages.push({ name: 'passport', version: 'latest', dev: false });
        packages.push({ name: 'passport-local', version: 'latest', dev: false });
    }

    // Add Fastify-specific packages
    packages.push({ name: '@fastify/cors', version: 'latest', dev: false });
    packages.push({ name: '@fastify/helmet', version: 'latest', dev: false });
    packages.push({ name: '@fastify/rate-limit', version: 'latest', dev: false });
    packages.push({ name: '@fastify/env', version: 'latest', dev: false });

    // Add feature packages
    for (const feature of answers.features || []) {
        if (feature === 'websocket') {
            packages.push({ name: '@fastify/websocket', version: 'latest', dev: false });
        } else if (feature === 'graphql') {
            packages.push({ name: '@fastify/gql', version: 'latest', dev: false });
        } else if (feature === 'swagger') {
            packages.push({ name: '@fastify/swagger', version: 'latest', dev: false });
            packages.push({ name: '@fastify/swagger-ui', version: 'latest', dev: false });
        } else {
            const featureInfo = featurePackageMap[feature];
            if (featureInfo) {
                if (featureInfo.deps) {
                    packages.push(...featureInfo.deps.map(name => ({ name, version: 'latest', dev: false })));
                }
                if (featureInfo.devDeps) {
                    packages.push(...featureInfo.devDeps.map(name => ({ name, version: 'latest', dev: true })));
                }
            }
        }
    }

    // Add testing packages if requested
    if (answers.includeTests) {
        packages.push({ name: 'jest', version: 'latest', dev: true });
        packages.push({ name: 'tap', version: 'latest', dev: true });
        packages.push({ name: '@types/jest', version: 'latest', dev: true });
    }

    await packageManager.installDependencies(projectPath, packages);
}
