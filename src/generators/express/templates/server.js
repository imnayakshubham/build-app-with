/**
 * Generate server.js file
 */

import { DATABASES } from '../../../types/index.js';

export function generateServerJs(projectPath, answers) {
  let content = `import app from './app.js';
import { logger } from './utils/logger.js';
import { connectDatabase } from './config/database.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(\`🚀 Server running on port \${PORT} in \${NODE_ENV} mode\`);
      logger.info(\`📊 Health check: http://localhost:\${PORT}/health\`);
      logger.info(\`🔗 API endpoint: http://localhost:\${PORT}/api\`);
    });
  } catch (error) {
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
