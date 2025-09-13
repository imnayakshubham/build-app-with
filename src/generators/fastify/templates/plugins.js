/**
 * Generate Fastify plugins template
 */

export function generatePlugins(projectPath, answers) {
    const pluginsContent = `import fp from 'fastify-plugin';

// Error handler plugin
export default fp(async function (fastify, opts) {
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    reply.status(statusCode).send({
      error: true,
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });

  // Not found handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      error: true,
      message: \`Route \${request.method}:\${request.url} not found\`,
      statusCode: 404
    });
  });
}, {
  name: 'error-handler'
});
`;

    return pluginsContent;
}
