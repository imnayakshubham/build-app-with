/**
 * Generate Docker template
 */

export function generateDocker(projectPath, answers) {
    const dockerfile = `# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
`;

    const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: ${answers.database === 'mongodb' ? 'mongo:latest' : 'postgres:15-alpine'}
    environment:
      ${answers.database === 'mongodb'
            ? 'MONGO_INITDB_DATABASE=myapp'
            : 'POSTGRES_DB=myapp\n      POSTGRES_USER=postgres\n      POSTGRES_PASSWORD=password'
        }
    volumes:
      - db_data:/data/db
    ports:
      - "${answers.database === 'mongodb' ? '27017:27017' : '5432:5432'}"
    restart: unless-stopped

volumes:
  db_data:
`;

    return { dockerfile, dockerCompose };
}
