/**
 * Generate main Fastify app.js file
 */

import { FEATURES, DATABASES } from '../../../types/index.js';

export function generateAppJs(projectPath, answers) {
    let content = `import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import env from '@fastify/env';
import { logger } from './utils/logger.js';
import { errorHandler } from './plugins/errorHandler.js';
import { notFound } from './plugins/notFound.js';

// Environment schema
const envSchema = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: {
      type: 'string',
      default: '3000'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0'
    }
`;

    // Add database environment variables
    if (answers.database === DATABASES.MONGODB) {
        content += `    MONGODB_URI: {
      type: 'string',
      default: 'mongodb://localhost:27017/${answers.projectName}'
    }
`;
    } else if (answers.database === DATABASES.POSTGRESQL || answers.database === DATABASES.SQLITE) {
        content += `    DATABASE_URL: {
      type: 'string',
      default: '${answers.database === DATABASES.POSTGRESQL ? 'postgresql://username:password@localhost:5432/' : 'file:./dev.db'}${answers.projectName}'
    }
`;
    } else if (answers.database === DATABASES.MYSQL) {
        content += `    DB_HOST: {
      type: 'string',
      default: 'localhost'
    },
    DB_PORT: {
      type: 'string',
      default: '3306'
    },
    DB_NAME: {
      type: 'string',
      default: '${answers.projectName}'
    },
    DB_USER: {
      type: 'string',
      default: 'root'
    },
    DB_PASSWORD: {
      type: 'string',
      default: 'password'
    }
`;
    }

    // Add authentication environment variables
    if (answers.authStrategy && answers.authStrategy !== 'none') {
        content += `    JWT_SECRET: {
      type: 'string',
      default: 'your-super-secret-jwt-key'
    },
    JWT_EXPIRES_IN: {
      type: 'string',
      default: '7d'
    }
`;
    }

    // Add CORS environment variables
    if (answers.features.includes(FEATURES.CORS)) {
        content += `    CORS_ORIGIN: {
      type: 'string',
      default: 'http://localhost:3000'
    }
`;
    }

    // Add rate limiting environment variables
    if (answers.features.includes('rate-limit')) {
        content += `    RATE_LIMIT_MAX: {
      type: 'string',
      default: '100'
    },
    RATE_LIMIT_TIME_WINDOW: {
      type: 'string',
      default: '60000'
    }
`;
    }

    content += `  }
};

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      } : undefined
    }
  });

  // Register environment plugin
  await fastify.register(env, { schema: envSchema });

  // Register security plugins
  await fastify.register(helmet);

  // Register CORS plugin
  if (answers.features.includes('cors')) {
    await fastify.register(cors, {
      origin: fastify.config.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    });
  }

  // Register rate limiting plugin
  if (answers.features.includes('rate-limit')) {
    await fastify.register(rateLimit, {
      max: parseInt(fastify.config.RATE_LIMIT_MAX) || 100,
      timeWindow: parseInt(fastify.config.RATE_LIMIT_TIME_WINDOW) || 60000
    });
  }

  // Register custom plugins
  await fastify.register(errorHandler);
  await fastify.register(notFound);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: fastify.config.NODE_ENV,
      version: '1.0.0'
    };
  });

  // API routes
  fastify.get('/api', async (request, reply) => {
    return {
      message: 'Welcome to ${answers.projectName} API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api'
      }
    };
  });

  return fastify;
}
`;

    return content;
}
