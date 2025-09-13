/**
 * Generate Fastify tests template
 */

export function generateTests(projectPath, answers) {
    const testsContent = `import { buildApp } from '../app.js';

describe('${answers.projectName} API', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('status', 'OK');
      expect(response.json()).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('message');
      expect(response.json()).toHaveProperty('version');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/unknown-route'
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toHaveProperty('error', true);
    });
  });
});
`;

    return testsContent;
}
