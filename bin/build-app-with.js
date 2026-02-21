#!/usr/bin/env node

// Bundled CLI executable
import { createApp } from '../dist/build-app-with.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';
import fs from 'fs';

const logger = { error: console.error, isDevelopment: false };

// Simple welcome message function
function welcomeMessage() {
  console.log('🚀 Welcome to Build App With!');
}

/**
 * Parse command line arguments
 * @returns {Object} Parsed CLI options
 */
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    projectName: null,
    help: false,
    version: false
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (!arg.startsWith('-') && !options.projectName) {
      // First non-flag argument is the project name
      options.projectName = arg;
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🚀 Build App With - Interactive Project Creator

USAGE:
  npx build-app-with [project-name] [options]

ARGUMENTS:
  project-name    Name of the project to create (optional)

OPTIONS:
  -h, --help     Show this help message
  -v, --version  Show version number

EXAMPLES:
  npx build-app-with                    # Interactive mode
  npx build-app-with my-awesome-app     # Create project with name
  npx build-app-with --help            # Show help

For more information, visit: https://github.com/imnayakshubham/build-app-with
`);
}

/**
 * Show version information
 */
async function showVersion() {
  try {
    const pkg = require('../package.json');
    console.log(`v${pkg.version}`);
  } catch {
    console.log('Version unavailable');
  }
}

async function main() {
  const options = parseCliArgs();

  // Handle help and version flags
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.version) {
    await showVersion();
    process.exit(0);
  }

  // Show welcome message
  welcomeMessage();

  // Create app with optional project name from CLI
  await createApp(options.projectName);
}

main().catch((error) => {
  logger.error(`Fatal error: ${error.message}`);
  if (logger.isDevelopment) {
    console.error(error.stack);
  }
  process.exit(1);
});