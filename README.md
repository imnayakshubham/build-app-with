# 🚀 New React App - Production-Grade Project Generator

A powerful CLI tool that generates production-ready applications with modern frameworks, best practices, and comprehensive boilerplate code.

## ✨ Features

### 🎯 Supported Frameworks
- **Next.js** - Full-stack React framework with App Router
- **Vite + React** - Lightning-fast frontend development
- **Express.js** - Production-ready Node.js backend
- **Fastify** - High-performance Node.js backend

### 🛠️ Production-Grade Features
- **TypeScript Support** - Full TypeScript configuration
- **Error Handling** - Comprehensive error handling and logging
- **Security** - Helmet, CORS, rate limiting, input validation
- **Database Integration** - MongoDB, PostgreSQL, MySQL, SQLite
- **Authentication** - JWT, Sessions, OAuth strategies
- **Testing** - Jest, Supertest, comprehensive test setup
- **Docker Support** - Production-ready containerization
- **Logging** - Winston logger with structured logging
- **API Documentation** - Swagger/OpenAPI integration
- **Code Quality** - ESLint, Prettier, Husky pre-commit hooks

### 🎨 Frontend Features
- **CSS Frameworks** - Tailwind, Bootstrap, MUI, Chakra UI, shadcn/ui
- **State Management** - Redux Toolkit, Zustand, MobX, Recoil
- **Data Fetching** - TanStack Query, Axios with interceptors
- **Forms** - React Hook Form, Formik with validation
- **Animations** - Framer Motion, React Spring
- **UI Components** - Ant Design, Material-UI, Chakra UI
- **Utilities** - React Icons, Toast notifications, i18n

### 🔧 Backend Features
- **Database ORMs** - Prisma, Mongoose, Sequelize
- **Authentication** - JWT, Passport.js, NextAuth
- **API Features** - tRPC, GraphQL support
- **Middleware** - CORS, Helmet, Morgan, Rate limiting
- **Validation** - Express Validator, Joi, Zod
- **Documentation** - Swagger/OpenAPI auto-generation

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g create-app-with

# Or use with npx
npx create-app-with my-awesome-app
```

### Usage

```bash
# Start the interactive CLI
create-app-with

# Or specify project name directly
create-app-with my-project
```

## 📁 Project Structure

```
src/
├── core/                    # Core utilities
│   ├── logger.js           # Centralized logging
│   ├── error-handler.js    # Error handling
│   └── package-manager.js  # Package management
├── generators/             # Framework generators
│   ├── nextjs/            # Next.js generator
│   ├── vite/              # Vite + React generator
│   ├── express/           # Express.js generator
│   └── fastify/           # Fastify generator
├── templates/             # Code templates
├── config/                # Configuration files
├── types/                 # Type definitions
└── utils/                 # Utility functions
```

## 🎯 Framework-Specific Features

### Next.js Generator
- App Router and Pages Router support
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- Middleware support
- Image optimization
- Font optimization
- Built-in TypeScript support

### Vite + React Generator
- Lightning-fast HMR
- Multiple project structures
- CSS framework integration
- State management setup
- Testing configuration
- Build optimization

### Express.js Generator
- Modular architecture
- Database integration
- Authentication strategies
- Middleware stack
- Error handling
- Logging configuration
- API documentation
- Docker support

### Fastify Generator
- Plugin-based architecture
- High performance
- Schema validation
- TypeScript support
- WebSocket support
- GraphQL integration
- Rate limiting
- CORS configuration

## 🔧 Configuration

### Environment Variables

Each generated project includes comprehensive environment configuration:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=your_database_url
MONGODB_URI=mongodb://localhost:27017/your_db

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Package Manager Support

- **npm** - Default package manager
- **yarn** - Fast, reliable, and secure
- **pnpm** - Efficient disk space usage

## 🧪 Testing

All generated projects include comprehensive testing setup:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐳 Docker Support

Production-ready Docker configuration:

```bash
# Build Docker image
docker build -t my-app .

# Run with Docker Compose
docker-compose up -d
```

## 📚 Documentation

Each generated project includes:
- Comprehensive README
- API documentation (Swagger)
- Code comments and JSDoc
- Architecture diagrams
- Deployment guides

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/imnayakshubham/create-app-with.git

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vite Team** - For the lightning-fast build tool
- **Express.js Team** - For the robust Node.js framework
- **Fastify Team** - For the high-performance Node.js framework
- **React Community** - For the incredible ecosystem

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/imnayakshubham/create-app-with/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/imnayakshubham/create-app-with/discussions)

## 🚀 Roadmap

- [ ] Vue.js support
- [ ] Svelte support
- [ ] Angular support
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline templates
- [ ] Monitoring and observability
- [ ] Performance optimization tools

---

**Made with ❤️ by the [Create New App](https://github.com/imnayakshubham/create-app-with)**

*Generate production-ready applications in seconds, not hours.*
