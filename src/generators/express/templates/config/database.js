/**
 * Database configuration template
 */

import { DATABASES } from '../../../types/index.js';

export function generateDatabaseConfig(answers) {
    if (answers.database === DATABASES.MONGODB) {
        return `import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/${answers.projectName}';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed through app termination');
  process.exit(0);
});
`;
    } else if (answers.database === DATABASES.POSTGRESQL || answers.database === DATABASES.SQLITE) {
        return `import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
  process.exit(0);
});

export { prisma };
`;
    } else if (answers.database === DATABASES.MYSQL) {
        return `import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';

const sequelize = new Sequelize(
  process.env.DB_NAME || '${answers.projectName}',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }
  } catch (error) {
    logger.error('MySQL connection error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  logger.info('MySQL connection closed');
  process.exit(0);
});

export { sequelize };
`;
    } else {
        return `// No database configuration needed
export async function connectDatabase() {
  console.log('No database configured');
}
`;
    }
}
