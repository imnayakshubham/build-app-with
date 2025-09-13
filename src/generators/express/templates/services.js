/**
 * Generate services template
 */

export function generateServices(projectPath, answers) {
    const servicesContent = `import { logger } from '../utils/logger.js';

export class BaseService {
  static async handleServiceCall(serviceName, operation, data = null) {
    try {
      logger.info(\`Service: \${serviceName} - Operation: \${operation}\`);
      
      // Add your business logic here
      const result = await this.performOperation(operation, data);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error(\`Service error in \${serviceName}:\`, error);
      throw error;
    }
  }

  static async performOperation(operation, data) {
    // Implement your business logic here
    return { operation, data };
  }
}

export class HealthService extends BaseService {
  static async getHealthStatus() {
    return this.handleServiceCall('HealthService', 'getStatus', {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      service: '${answers.projectName}'
    });
  }
}

export class ApiService extends BaseService {
  static async getApiInfo() {
    return this.handleServiceCall('ApiService', 'getInfo', {
      message: 'Welcome to ${answers.projectName} API',
      version: '1.0.0',
      features: ['REST API', 'Health Check', 'Error Handling']
    });
  }
}
`;

    return servicesContent;
}
