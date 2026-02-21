# Build App With

**Interactive CLI for scaffolding production-ready web applications**

[![npm version](https://img.shields.io/npm/v/build-app-with.svg)](https://www.npmjs.com/package/build-app-with)
[![license](https://img.shields.io/npm/l/build-app-with.svg)](LICENSE)
[![node](https://img.shields.io/node/v/build-app-with.svg)](package.json)

Choose a framework, pick your features, and get a fully configured project in seconds — no manual setup required.

## Quick Start

```bash
# Run directly (no install needed)
npx build-app-with

# Or provide a project name upfront
npx build-app-with my-app
```

**Prerequisites:** Node.js 18+ and npm 8+

```bash
npx build-app-with --help       # Show usage info
npx build-app-with --version    # Show version
```

## Supported Frameworks

| Framework | Type | Description |
|-----------|------|-------------|
| **Next.js** | Full-stack | SSR, API routes, App Router. TypeScript enforced. |
| **Vite + React** | Frontend | Lightning-fast HMR with optional TypeScript. |
| **Rsbuild + React** | Frontend | Rust-powered bundler (Rspack). TypeScript enforced. |
| **Express.js** | Backend | Traditional Node.js web server with extensive middleware ecosystem. |
| **Fastify** | Backend | High-performance Node.js API framework with plugin architecture. |

## Preset System

When you choose **Vite + React** or **Rsbuild + React**, you pick a preset that determines default features:

| Preset | What's Included |
|--------|----------------|
| **Starter** | React + CSS only. Minimal starting point. |
| **Standard** (default) | React Router DOM, Zustand, React Hook Form, React Icons, React Toastify |
| **Full** | Everything in Standard + Framer Motion, React Table, React Helmet, react-i18next |
| **Custom** | Choose every feature manually |

Standard and Full presets let you add more features on top of the defaults. Next.js and backend frameworks use a Default / Customize toggle instead.

## Features Reference

### CSS Frameworks (Frontend)

Tailwind CSS, Bootstrap, Material-UI (MUI), Chakra UI, shadcn/ui, Mantine, Styled Components, or Vanilla CSS.

Available for Vite, Rsbuild (all non-Starter presets), and Next.js (Customize mode).

### Authentication

**Frontend (Next.js, Vite, Rsbuild):**
Clerk, NextAuth.js (Next.js only), Auth0, Firebase Auth

**Backend (Express, Fastify):**
JWT, Session-based, OAuth (Passport.js)

### Project Structure

**React frontends (Vite, Rsbuild):**

| Structure | Description |
|-----------|-------------|
| Simple | Flat `src/` with basic components — good for prototypes |
| Feature-based | Organized by feature (`features/auth/`, `features/dashboard/`) with shared hooks, services, and utils |
| Domain-driven | Enterprise pattern with `domains/`, `shared/`, `app/`, and `infrastructure/` layers |

**Express:**
Simple, Modular (by feature), or Layered (Controller-Service-Repository)

**Fastify:**
Simple, Modular (by feature), or Plugin-based (Fastify plugins)

### React Feature Categories

These 7 categories are available for Vite + React and Rsbuild + React projects (Custom preset, or as additions to Standard/Full):

| Category | Options |
|----------|---------|
| **Routing** | React Router DOM |
| **State Management** | Redux Toolkit, Zustand, MobX, Recoil |
| **Forms** | React Hook Form, Formik |
| **Animations** | Framer Motion, React Spring, React Transition Group |
| **Drag & Drop** | React DnD, React Beautiful DnD |
| **UI Libraries** | Ant Design, Bootstrap, MUI, Chakra UI, shadcn/ui, Mantine |
| **Utilities** | React Icons, React Toastify, React Table, React Select, React Helmet, react-i18next, Storybook |

### Backend Features (Express / Fastify)

| Category | Options |
|----------|---------|
| **Databases** | MongoDB, PostgreSQL, MySQL, SQLite |
| **ORMs** | Mongoose (MongoDB), Prisma (PostgreSQL/SQLite), Sequelize (MySQL) |
| **Security** | CORS, Helmet (Express), Rate limiting (Fastify) |
| **Logging** | Morgan (request logging), Winston (structured logging) |
| **Validation** | Express Validator / Fastify validation |
| **API Docs** | Swagger / OpenAPI |
| **Environment** | dotenv (.env support) |
| **Testing** | Jest test setup with example tests |
| **Docker** | Dockerfile and docker-compose configuration |

Fastify also supports **WebSocket** and **GraphQL** as additional feature choices.

## Interactive Flow

Running `npx build-app-with` walks you through these steps:

```
? Choose your app framework:
  > Next.js (React Full-stack)
    Vite + React (Frontend)
    Rsbuild + React (Frontend)
    Express.js (Node.js Backend)
    Fastify (Node.js Backend)

? Choose your project setup:          # React frontends only
  > Starter / Standard / Full / Custom

? What is your project name?          # Skipped if provided via CLI
  > my-app

? Use TypeScript?                     # Vite Custom preset only
  > Yes / No

? Choose a CSS framework:             # Frontend frameworks
  > Tailwind CSS / Bootstrap / MUI / ...

? Choose authentication strategy:     # Customize mode
  > Clerk / NextAuth.js / Auth0 / ...

? Select Routing features:            # React feature categories
? Select State Management features:
? Select Forms features:
  ...

? After setup, do you want to:
  [ ] Initialize a Git repository
  [ ] Install dependencies
  [ ] Run the development server
```

## After Project Creation

```bash
cd my-app
npm install       # If not done during setup
npm run dev       # Start development server
```

**Default ports:**

| Framework | Port | URL |
|-----------|------|-----|
| Next.js | 3000 | http://localhost:3000 |
| Vite + React | 5173 | http://localhost:5173 |
| Rsbuild + React | 3000 | http://localhost:3000 |
| Express.js | 3000 | http://localhost:3000 |
| Fastify | 3000 | http://localhost:3000 |

## Project Structure Example

A typical **Vite + React** project with the **feature-based** structure:

```
my-app/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   └── common/
│   │       └── Header.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   └── dashboard/
│   │       └── Dashboard.tsx
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   └── api.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── types/
│       └── index.ts
├── .env
├── .gitignore
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Why Build App With?

- **Fast** — Go from zero to a running project in seconds
- **Production-ready** — Security best practices, proper project structure, and sensible defaults built in
- **Flexible** — 5 frameworks, 4 presets, 30+ configurable features — pick exactly what you need
- **Secure** — Path traversal prevention, command injection guards, and secret generation for backend projects
- **Current** — Uses latest stable versions of all dependencies

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.

## Support

- Issues: [GitHub Issues](https://github.com/imnayakshubham/build-app-with/issues)
- Discussions: [GitHub Discussions](https://github.com/imnayakshubham/build-app-with/discussions)
