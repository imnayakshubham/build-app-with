/**
 * Generate Fastify routes template
 */

export function generateRoutes(projectPath, answers) {
    const routesContent = `export async function routes(fastify, options) {
  // Health check route
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: '${answers.projectName}'
    };
  });

  // API info route
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
}
`;

    return routesContent;
}
