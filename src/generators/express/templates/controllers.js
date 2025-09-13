/**
 * Generate controllers template
 */

export function generateControllers(projectPath, answers) {
    const controllersContent = `import { logger } from '../utils/logger.js';

export class BaseController {
  static async handleRequest(req, res, next, handler) {
    try {
      const result = await handler(req, res);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Controller error:', error);
      next(error);
    }
  }
}

export class HealthController extends BaseController {
  static async check(req, res) {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: '${answers.projectName}'
    };
  }
}

export class ApiController extends BaseController {
  static async getInfo(req, res) {
    return {
      message: 'Welcome to ${answers.projectName} API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api'
      }
    };
  }
}
`;

    return controllersContent;
}
