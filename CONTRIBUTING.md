# 🤝 Contributing to New React App

Thank you for your interest in contributing to New React App! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/imnayakshubham/create-app-with.git
   cd create-app-with
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/imnayakshubham/create-app-with.git
   ```

## 🛠️ Development Setup

### Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

### Development Scripts

```bash
# Run the CLI in development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Testing Your Changes

```bash
# Test the CLI locally
npm run dev

# Test with a specific framework
npm run dev -- --framework=express

# Test with custom options
npm run dev -- --project-name=test-app --framework=nextjs
```

## 📁 Project Structure

```
src/
├── core/                    # Core utilities and shared logic
│   ├── logger.js           # Centralized logging
│   ├── error-handler.js    # Error handling utilities
│   └── package-manager.js  # Package management utilities
├── generators/             # Framework-specific generators
│   ├── nextjs/            # Next.js generator
│   ├── vite/              # Vite + React generator
│   ├── express/           # Express.js generator
│   └── fastify/           # Fastify generator
├── templates/             # Code templates and boilerplates
├── config/                # Configuration files
├── types/                 # Type definitions and constants
├── utils/                 # Utility functions
└── prompts/               # CLI prompts and questions
```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

1. **Bug Fixes** - Fix issues and bugs
2. **New Features** - Add new functionality
3. **Framework Support** - Add support for new frameworks
4. **Documentation** - Improve documentation
5. **Tests** - Add or improve tests
6. **Performance** - Optimize performance
7. **Refactoring** - Improve code quality

### Before You Start

1. Check existing issues and pull requests
2. Create an issue to discuss major changes
3. Fork the repository
4. Create a feature branch

### Branch Naming

Use descriptive branch names:

```bash
# For features
feature/add-vue-support
feature/improve-error-handling

# For bug fixes
fix/nextjs-typescript-issue
fix/express-database-connection

# For documentation
docs/update-readme
docs/add-contributing-guide
```

## 🔄 Pull Request Process

### 1. Create a Pull Request

1. Push your changes to your fork
2. Create a pull request against the main branch
3. Fill out the pull request template

### 2. Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### 3. Review Process

- All pull requests require review
- Address feedback promptly
- Keep pull requests focused and small
- Update documentation as needed

## 🐛 Issue Guidelines

### Before Creating an Issue

1. Search existing issues
2. Check if it's already fixed
3. Verify it's a real issue

### Issue Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Node.js version: [e.g., 18.0.0]
- CLI version: [e.g., 2.0.0]

## Additional Context
Any other relevant information
```

## 📏 Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow async/await patterns
- Use meaningful variable names
- Add JSDoc comments for functions
- Use const/let instead of var

### Code Style

```javascript
// Good
const generateProject = async (projectPath, options) => {
  try {
    const result = await processProject(projectPath, options);
    return result;
  } catch (error) {
    logger.error('Failed to generate project:', error);
    throw error;
  }
};

// Bad
function generateProject(projectPath, options) {
  return processProject(projectPath, options).then(result => {
    return result;
  }).catch(error => {
    console.log(error);
  });
}
```

### File Organization

- One main export per file
- Group related functions together
- Use descriptive file names
- Keep files focused and small

### Error Handling

```javascript
// Good
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  throw new ProjectGeneratorError('Failed to complete operation', 'OPERATION_ERROR');
}

// Bad
try {
  await riskyOperation();
} catch (error) {
  console.log(error);
}
```

## 🧪 Testing

### Writing Tests

- Write tests for new functionality
- Test error cases
- Use descriptive test names
- Keep tests simple and focused

### Test Structure

```javascript
describe('ProjectGenerator', () => {
  describe('generateProject', () => {
    it('should generate project with valid options', async () => {
      // Test implementation
    });

    it('should throw error with invalid options', async () => {
      // Test implementation
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=project-generator.test.js
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Include examples where helpful
- Keep comments up to date

### README Updates

- Update README for new features
- Include usage examples
- Update installation instructions
- Add troubleshooting section

### API Documentation

- Document all public APIs
- Include parameter descriptions
- Provide usage examples
- Document return values

## 🚀 Release Process

### Version Bumping

- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

### Changelog

- Document all changes
- Group by type (Added, Changed, Fixed, Removed)
- Include migration notes for breaking changes

## 🤔 Questions?

If you have questions about contributing:

- Check existing issues and discussions
- Create a new issue with the "question" label
- Join our community discussions
- Contact maintainers directly

## 🙏 Recognition

Contributors will be recognized in:

- README contributors section
- Release notes
- Project documentation
- Community highlights

---

**Thank you for contributing to New React App! 🎉**

*Together, we're building amazing tools for developers worldwide.*
