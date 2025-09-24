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

# Run core tests only
npm run test:core

# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix

# Format code
npm run format

# Version management (for maintainers)
npm run version:patch   # Bug fixes (2.0.0 → 2.0.1)
npm run version:minor   # New features (2.0.0 → 2.1.0)
npm run version:major   # Breaking changes (2.0.0 → 3.0.0)
```

### Testing Structure
- Unit tests: `src/__tests__/core/` - Test core utilities (logger, error handling)
- E2E tests: `src/__tests__/e2e/` - Test CLI integration and framework generation
- Test setup: `src/__tests__/setup.js` - Jest configuration with mocked dependencies
- All tests use comprehensive mocking for fs-extra, inquirer, ora, chalk, and execa

## Architecture

### Core Application Flow
The CLI follows a linear orchestration pattern in `src/create-app.js`:
1. **Prompting Phase**: Collect user preferences via `src/prompts/index.js`
2. **Name Resolution**: Handle project name conflicts with incremental naming (`my-app`, `my-app-1`, etc.)
3. **Directory Management**: Create project directory (except Next.js which handles its own)
4. **Framework Generation**: Route to appropriate generator based on framework choice
5. **File Management**: Ensure .gitignore and .env files exist with proper content
6. **Dependency Installation**: Auto-detect and use npm/yarn/pnpm via `src/utils/dependencies.js`

### Framework Generator Architecture
Each generator follows a consistent two-phase pattern:
- **Phase 1**: Framework-specific prompts (auth, database, features) via `prompts.js`
- **Phase 2**: Project structure generation via dedicated generator files

**Generator Structure:**
- `src/generators/{framework}/index.js` - Main entry point with error handling
- `src/generators/{framework}/prompts.js` - Framework-specific questions
- `src/generators/{framework}/project-generator.js` - Core generation logic
- `src/generators/{framework}/templates/` - File templates for different components

### Prompting System Architecture
The prompting system in `src/prompts/index.js` uses a conditional flow:
- **Primary Prompts**: Framework selection, setup type (default/customize), project name
- **Conditional Prompts**: Only shown when `setupType === 'customize'`
- **Post-Processing**: `finalizeAnswers()` enforces framework-specific rules (e.g., Next.js always uses TypeScript)

### Core Utilities
- **`src/core/logger.js`** - Centralized logging with ora spinner integration and environment-aware output
- **`src/core/error-handler.js`** - Validation and error handling with user-friendly messages
- **`src/core/package-manager.js`** - Auto-detection of npm/yarn/pnpm and dependency management
- **`src/utils/`** - Helper utilities for messages, credits, dependencies, and answer processing

### Project Structure Generation
Vite generator supports three architectural patterns:
- **Simple**: Basic src/components/pages structure
- **Feature-based**: Organized by feature modules (auth, dashboard, etc.)
- **Domain-driven**: Advanced architecture with domains, services, and repositories

### Template System
- Templates are JavaScript functions that return file content strings
- Dynamic content generation based on user answers (TypeScript/JavaScript, CSS framework, etc.)
- Consistent file naming and structure across all generators

### Unique Implementation Details
- **Conflict Resolution**: Automatic project name incrementing with user notification
- **Framework Detection**: Next.js uses `create-next-app`, others use custom file generation
- **Environment Files**: Automatic .env creation and .gitignore management for all frameworks
- **Credit System**: Tracks generated components via `src/utils/credits.js`
- **Error Recovery**: Comprehensive validation and user-friendly error messages throughout

## Development Notes

- ES modules throughout (type: "module" in package.json)
- Node.js 18+ and npm 8+ minimum requirements
- All async operations use proper error handling with try/catch
- Generators follow consistent patterns for maintainability
- Template functions are pure and testable
- CLI uses inquirer for prompts, ora for spinners, chalk for colors
- Project name validation ensures filesystem compatibility