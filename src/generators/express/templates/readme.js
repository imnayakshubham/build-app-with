/**
 * Generate README for Express.js project
 */

import { DATABASES, AUTH_STRATEGIES } from '../../../types/index.js';
import { generateCreditsSection } from '../../../utils/credits.js';

export function generateReadme(projectPath, answers) {
    const selectedFeatures = Array.isArray(answers.features) ? answers.features : [];
    const allFeatures = [...selectedFeatures];
    if (answers.database && answers.database !== 'none') {
        allFeatures.push(answers.database);
    }
    if (answers.authStrategy && answers.authStrategy !== 'none') {
        allFeatures.push(answers.authStrategy);
    }
    if (answers.includeTests) {
        allFeatures.push('jest');
    }
    if (answers.includeDocker) {
        allFeatures.push('docker');
    }

    const credits = generateCreditsSection('express', allFeatures);

    const readme = `# ${answers.projectName}

A production-ready Express.js application built with modern best practices.

## 🚀 Features

- ⚡ **Express.js** - Fast, unopinionated web framework
- 🔒 **Security** - Helmet, CORS, rate limiting
- 🗄️ **Database** - ${answers.database === 'none' ? 'No database' : answers.database} integration
- 🔐 **Authentication** - ${answers.authStrategy === 'none' ? 'No authentication' : answers.authStrategy} strategy
- 📝 **Logging** - Winston logger with structured logging
- ✅ **Validation** - Request validation and sanitization
- 🧪 **Testing** - Jest and Supertest setup
- 📚 **Documentation** - API documentation with Swagger
- 🐳 **Docker** - Production-ready containerization

## 🛠️ Tech Stack

${generateTechStack(answers)}

## 📁 Project Structure

\`\`\`
${answers.projectName}/
├── src/
│   ├── controllers/        # Route controllers
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── tests/                 # Test files
├── logs/                  # Log files
├── .env.example          # Environment variables example
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
└── README.md             # This file
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
${answers.database !== 'none' ? `- ${answers.database} database` : ''}

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd ${answers.projectName}
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Set up the database**
   ${generateDatabaseSetup(answers)}

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

The server will start on \`http://localhost:3000\`

## 📚 API Documentation

Once the server is running, you can access:

- **API Base URL**: \`http://localhost:3000/api\`
- **Health Check**: \`http://localhost:3000/health\`
${answers.features.includes('swagger') ? '- **API Documentation**: `http://localhost:3000/api-docs`' : ''}

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## 🐳 Docker

\`\`\`bash
# Build Docker image
docker build -t ${answers.projectName} .

# Run with Docker Compose
docker-compose up -d
\`\`\`

## 📝 Available Scripts

- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with nodemon
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:coverage\` - Run tests with coverage report
${answers.database === 'postgresql' || answers.database === 'sqlite' ? `
- \`npm run db:generate\` - Generate Prisma client
- \`npm run db:push\` - Push schema to database
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:studio\` - Open Prisma Studio
` : ''}

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`PORT\` | Server port | \`3000\` |
| \`NODE_ENV\` | Environment | \`development\` |
${generateEnvVars(answers)}

## 🚀 Deployment

### Production Checklist

- [ ] Set \`NODE_ENV=production\`
- [ ] Configure proper database connection
- [ ] Set up logging and monitoring
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure environment variables
- [ ] Set up process manager (PM2)
- [ ] Configure backup strategy

### PM2 Configuration

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start src/server.js --name "${answers.projectName}"

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js Team** - For the amazing web framework
- **Node.js Community** - For the incredible ecosystem
- **MongoDB/PostgreSQL/MySQL Teams** - For the robust databases
- **Jest Team** - For the testing framework
- **Winston Team** - For the logging library

---

${credits}
`;

    return readme;
}

function generateTechStack(answers) {
    const stack = ['- **Node.js** - JavaScript runtime'];

    if (answers.database !== 'none') {
        stack.push(`- **Database** - ${answers.database}`);
    }

    if (answers.authStrategy !== 'none') {
        stack.push(`- **Authentication** - ${answers.authStrategy}`);
    }

    if (answers.features.includes('cors')) {
        stack.push('- **CORS** - Cross-origin resource sharing');
    }

    if (answers.features.includes('helmet')) {
        stack.push('- **Helmet** - Security headers');
    }

    if (answers.features.includes('morgan')) {
        stack.push('- **Morgan** - HTTP request logger');
    }

    if (answers.features.includes('winston')) {
        stack.push('- **Winston** - Logging library');
    }

    if (answers.features.includes('swagger')) {
        stack.push('- **Swagger** - API documentation');
    }

    if (answers.includeTests) {
        stack.push('- **Jest** - Testing framework');
        stack.push('- **Supertest** - HTTP assertion library');
    }

    return stack.join('\n');
}

function generateDatabaseSetup(answers) {
    if (answers.database === 'mongodb') {
        return `   \`\`\`bash
   # Start MongoDB (if using local instance)
   mongod
   \`\`\``;
    } else if (answers.database === 'postgresql') {
        return `   \`\`\`bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   \`\`\``;
    } else if (answers.database === 'mysql') {
        return `   \`\`\`bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE ${answers.projectName};"
   \`\`\``;
    } else if (answers.database === 'sqlite') {
        return `   \`\`\`bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   \`\`\``;
    }
    return '';
}

function generateEnvVars(answers) {
    const vars = [];

    if (answers.database === 'mongodb') {
        vars.push(`| \`MONGODB_URI\` | MongoDB connection string | \`mongodb://localhost:27017/${answers.projectName}\` |`);
    } else if (answers.database === 'postgresql' || answers.database === 'sqlite') {
        vars.push('| `DATABASE_URL` | Database connection string | `postgresql://...` |');
    } else if (answers.database === 'mysql') {
        vars.push('| `DB_HOST` | MySQL host | `localhost` |');
        vars.push('| `DB_PORT` | MySQL port | `3306` |');
        vars.push(`| \`DB_NAME\` | MySQL database name | \`${answers.projectName}\` |`);
        vars.push('| `DB_USER` | MySQL username | `root` |');
        vars.push('| `DB_PASSWORD` | MySQL password | `password` |');
    }

    if (answers.authStrategy !== 'none') {
        vars.push('| `JWT_SECRET` | JWT secret key | `your-secret-key` |');
        vars.push('| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |');
    }

    if (answers.features.includes('cors')) {
        vars.push('| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |');
    }

    return vars.join('\n');
}
