/**
 * Fastify specific prompts
 */

import { FRAMEWORKS, FEATURES, DATABASES, AUTH_STRATEGIES } from '../../types/index.js';

export function getFastifyPrompts(answers) {
    return [
        {
            type: 'list',
            name: 'database',
            message: 'Choose a database:',
            choices: [
                { name: 'MongoDB (with Mongoose)', value: DATABASES.MONGODB },
                { name: 'PostgreSQL (with Prisma)', value: DATABASES.POSTGRESQL },
                { name: 'MySQL (with Sequelize)', value: DATABASES.MYSQL },
                { name: 'SQLite (with Prisma)', value: DATABASES.SQLITE },
                { name: 'None', value: 'none' }
            ],
            default: DATABASES.MONGODB
        },
        {
            type: 'list',
            name: 'authStrategy',
            message: 'Choose authentication strategy:',
            choices: [
                { name: 'JWT (JSON Web Tokens)', value: AUTH_STRATEGIES.JWT },
                { name: 'Session-based', value: AUTH_STRATEGIES.SESSION },
                { name: 'OAuth (Passport.js)', value: AUTH_STRATEGIES.OAUTH },
                { name: 'None', value: 'none' }
            ],
            default: AUTH_STRATEGIES.JWT,
            when: (answers) => answers.database !== 'none'
        },
        {
            type: 'checkbox',
            name: 'features',
            message: 'Select additional features:',
            choices: [
                { name: 'CORS support', value: FEATURES.CORS },
                { name: 'Rate limiting', value: 'rate-limit' },
                { name: 'Request logging', value: FEATURES.MORGAN },
                { name: 'Winston logger', value: FEATURES.WINSTON },
                { name: 'Request validation', value: 'fastify-validation' },
                { name: 'API documentation (Swagger)', value: FEATURES.SWAGGER },
                { name: 'Environment variables (.env)', value: FEATURES.DOTENV },
                { name: 'WebSocket support', value: 'websocket' },
                { name: 'GraphQL support', value: 'graphql' }
            ],
            default: [FEATURES.CORS, 'rate-limit', FEATURES.MORGAN, FEATURES.DOTENV]
        },
        {
            type: 'list',
            name: 'projectStructure',
            message: 'Choose project structure:',
            choices: [
                { name: 'Simple (Basic structure)', value: 'simple' },
                { name: 'Modular (Organized by features)', value: 'modular' },
                { name: 'Plugin-based (Fastify plugins)', value: 'plugin-based' }
            ],
            default: 'plugin-based'
        },
        {
            type: 'confirm',
            name: 'includeTests',
            message: 'Include testing setup?',
            default: true
        },
        {
            type: 'confirm',
            name: 'includeDocker',
            message: 'Include Docker configuration?',
            default: false
        }
    ];
}
