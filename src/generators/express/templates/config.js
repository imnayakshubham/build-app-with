/**
 * Generate config template
 */

export function generateConfig(projectPath, answers) {
    const configContent = `import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || process.env.MONGODB_URI,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || '${answers.projectName}',
    user: process.env.DB_USER || 'dbuser',
    // WARNING: This is a development default - MUST be changed for production!
    password: process.env.DB_PASSWORD || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DB_PASSWORD environment variable is required in production');
      }
      return 'DEV_ONLY_CHANGE_ME';
    })()
  },
  auth: {
    // WARNING: This is a development default - MUST be changed for production!
    jwtSecret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
      }
      return 'DEV_ONLY_INSECURE_SECRET_CHANGE_ME_IN_PRODUCTION';
    })(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW) || 60000
  }
};

export default config;
`;

    return configContent;
}
