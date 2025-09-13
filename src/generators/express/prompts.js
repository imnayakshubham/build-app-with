/**
 * Express.js specific prompts
 */

import { FRAMEWORKS, FEATURES, DATABASES, AUTH_STRATEGIES } from '../../types/index.js';

export function getExpressPrompts(answers) {
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
                { name: 'CORS middleware', value: FEATURES.CORS },
                { name: 'Security headers (Helmet)', value: FEATURES.HELMET },
                { name: 'Request logging (Morgan)', value: FEATURES.MORGAN },
                { name: 'Winston logger', value: FEATURES.WINSTON },
                { name: 'Request validation', value: FEATURES.EXPRESS_VALIDATOR },
                { name: 'API documentation (Swagger)', value: FEATURES.SWAGGER },
                { name: 'Environment variables (.env)', value: FEATURES.DOTENV }
            ],
            default: [FEATURES.CORS, FEATURES.HELMET, FEATURES.MORGAN, FEATURES.DOTENV]
        },
        {
            type: 'list',
            name: 'projectStructure',
            message: 'Choose project structure:',
            choices: [
                { name: 'Simple (Basic structure)', value: 'simple' },
                { name: 'Modular (Organized by features)', value: 'modular' },
                { name: 'Layered (Controller-Service-Repository)', value: 'layered' }
            ],
            default: 'modular'
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
