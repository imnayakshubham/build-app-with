# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development and Testing
```bash
npm run dev              # Run CLI from source (bin/cli.js → src/)
npm start                # Same as dev
npm run build            # Webpack bundle to dist/build-app-with.cjs
npm test                 # Run all tests
npm run test:core        # Run only core/ tests (jest --testPathPattern=core)
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage report
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format src/
```

### Running a Single Test
```bash
npx jest src/__tests__/core/logger.test.js        # By file path
npx jest --testPathPattern="security-fixes"        # By pattern
npx jest --testNamePattern="should log info"       # By test name
```

### Publishing (maintainers)
```bash
npm run version:patch    # Bump patch, build, test, publish, push tags
npm run version:minor    # Bump minor
npm run version:major    # Bump major
```
The `prepublishOnly` script runs `npm run build && npm run test:core && npm run lint` automatically.

## Architecture

### Dual Entry Point System
- **`bin/cli.js`** — Development entry (`npm run dev`). Imports directly from `src/create-app.js`.
- **`bin/build-app-with.js`** — Published npm binary (`npx build-app-with`). Imports from `dist/build-app-with.cjs` (the webpack bundle). The `src/` directory is not published.
- Both parse `--help`, `--version`, and an optional positional project-name argument, then call `createApp(projectName)`.

### Webpack Build
- Entry: `src/create-app.js` → Output: `dist/build-app-with.cjs` (CommonJS)
- External dependencies (not bundled): `inquirer`, `fs-extra`, `execa`, `chalk`, `ora`
- Minification disabled for readable output

### Core Application Flow (`src/create-app.js`)
1. **Prompting**: `getPrompts(cliProjectName)` → `inquirer.prompt()` → `finalizeAnswers()`
2. **Path Resolution**: `generateUniqueProjectPath()` — auto-increments name on conflict (`my-app` → `my-app-1`)
3. **Directory Creation**: `safeCreateDirectory()` — skipped for Next.js (create-next-app handles it)
4. **Generator Routing**: Dispatches to framework-specific generator based on `answers.framework`
5. **Post-generation**: Ensures `.gitignore` includes `.env`, creates `.env` if missing
6. **Dependency Install**: Runs if user opted in via `answers.postSetup`

### Framework Generators

Four generators under `src/generators/`:

| Generator | Entry Point | Approach |
|-----------|------------|----------|
| `vite/` | `vite-project-generator.js` | Custom file generation with config generators |
| `nextjs/` | `nextjs-generator.js` | Runs `create-next-app` via `secureExec`, then overlays files |
| `express/` | `index.js` | Two-phase: prompts then template-based generation |
| `fastify/` | `index.js` | Same two-phase pattern as Express |

Each backend generator (express/fastify) follows: `index.js` → `prompts.js` → `project-generator.js` → `templates/`

Vite generator has sub-modules for configs (`vite-config-generator.js`, `tailwind-config-generator.js`, `eslint-config-generator.js`), components, styles, and three structure patterns (simple, feature-based, domain-driven) under `structures/`.

### Prompting System (`src/prompts/index.js`)

Three exported functions:
- **`getPrompts(cliProjectName)`** — Builds ordered prompt list with conditional `when` guards
- **`getFeaturePrompts(currentAnswers)`** — 7 feature categories (routing, state, forms, animations, drag-drop, UI libs, utilities), gated by `setupType === 'customize'` or vite preset
- **`finalizeAnswers(answers)`** — Post-processing: forces TypeScript for Next.js, applies preset features, maps preset to setupType

**Vite Preset System**: Users choose a preset (starter/standard/full/custom) that determines default features. Defined in `src/constants/vite-features.js` with `PRESET_FEATURES` mapping, `DEPENDENCY_VERSIONS` for pinned versions, and `FEATURE_PACKAGES` for npm package names.

### Security Layer
- **`src/utils/path-security.js`** — Project name validation, path traversal prevention, safe directory creation
- **`src/utils/secure-exec.js`** — Command injection prevention, argument sanitization for `execa` calls
- **`src/utils/security.js`** — Secure secret generation for JWT, database passwords, API keys

### Key Utility Files
- **`src/config/package-mappings.js`** — Centralized framework/feature → npm package mapping
- **`src/constants/vite-features.js`** — Presets, feature constants, dependency versions, package mappings
- **`src/utils/answer-helpers.js`** — `mergeFeatures()`, `applyPresetFeatures()`, `presetToSetupType()`
- **`src/utils/dependency-helpers.js`** — `getFeaturePackages()`, `addFeatureDependencies()`
- **`src/generators/package-json-generator.js`** — Shared `package.json` builder for Vite projects

### Testing
- Tests in `src/__tests__/` — `core/` (unit), `e2e/` (integration), `security/` (validation)
- Global mocks in `src/__tests__/setup.js`: fs-extra, inquirer, ora, chalk, execa, console.*, process.exit
- Jest uses babel-jest to transform ESM → CJS (configured in `babel.config.js`)
- `transformIgnorePatterns` allows ESM deps (chalk, ora, inquirer, execa, fs-extra) through Babel

## Development Notes

- ES modules throughout (`"type": "module"` in package.json)
- Node.js 18+ and npm 8+ required
- Templates are JS functions returning file content strings, with dynamic content based on user answers
- `index.js` at root is a placeholder (`"main"` in package.json) — not used by the CLI
