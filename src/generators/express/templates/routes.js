/**
 * Generate routes template
 */

export function generateRoutes(projectPath, answers) {
    const routesContent = `import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: '${answers.projectName}'
  });
});

// API routes
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${answers.projectName} API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

export default router;
`;

    return routesContent;
}
