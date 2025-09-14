# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development and Testing
```bash
# Run the CLI tool in development mode
npm run dev

# Start the CLI tool
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix

# Format code
npm run format
```

### Testing Individual Components
The codebase uses Jest for testing. Tests are located in `src/__tests__/` directory.

## Architecture

### Core Structure
- **`src/create-app.js`** - Main application entry point that orchestrates project generation
- **`bin/cli.js`** - CLI executable that invokes the main application
- **`src/prompts/index.js`** - Interactive prompts system for user configuration
- **`src/core/`** - Core utilities (logger, error handling, package management)

### Framework Generators
The tool supports four frameworks, each with dedicated generators:
- **`src/generators/nextjs/`** - Next.js project generation
- **`src/generators/vite/`** - Vite + React project generation
- **`src/generators/express/`** - Express.js backend generation
- **`src/generators/fastify/`** - Fastify backend generation

### Key Components
- **Template System**: Each generator contains templates for different project structures and configurations
- **Package Management**: Automatic dependency installation with npm/yarn/pnpm detection
- **Project Structures**: Support for simple, feature-based, and domain-driven architectures
- **Configuration Generation**: Dynamic generation of config files (ESLint, Prettier, Tailwind, etc.)

### Prompt Flow
1. Framework selection (Next.js, Vite+React, Express, Fastify)
2. Setup type (Default vs Customize)
3. Framework-specific customization options
4. Project generation and dependency installation

### Unique Features
- Automatic project name conflict resolution with incremental naming
- Comprehensive .gitignore and .env file management
- Framework-agnostic dependency management
- Credit system for tracking generated components
- Interactive setup with ora spinners and chalk styling

## Development Notes

- The codebase is written in ES modules (type: "module" in package.json)
- Uses Node.js 18+ with npm 8+ as minimum requirements
- Follows a modular architecture with clear separation of concerns
- All generators follow consistent patterns for template creation and file writing