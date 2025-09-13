/**
 * Generate server.js file for Fastify
 */

import { DATABASES } from '../../../types/index.js';

export function generateServerJs(projectPath, answers) {
    let content = `import { buildApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Build Fastify app
    const fastify = await buildApp();
    
    // Start server
    await fastify.listen({ port: PORT, host: HOST });
    
    logger.info(\`🚀 Server running on http://\${HOST}:\${PORT} in \${NODE_ENV} mode\`);
    logger.info(\`📊 Health check: http://\${HOST}:\${PORT}/health\`);
    logger.info(\`🔗 API endpoint: http://\${HOST}:\${PORT}/api\`);
`;

    // Add Swagger documentation URL if enabled
    if (answers.features.includes('swagger')) {
        content += `    logger.info(\`📚 API Documentation: http://\${HOST}:\${PORT}/documentation\`);
`;
    }

    content += `  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
`;

    return content;
}
