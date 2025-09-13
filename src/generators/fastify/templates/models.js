/**
 * Generate Fastify models template
 */

import { DATABASES } from '../../../types/index.js';

export function generateModels(projectPath, answers) {
    if (answers.database === DATABASES.MONGODB) {
        return generateMongooseModels(answers);
    } else if (answers.database === DATABASES.POSTGRESQL || answers.database === DATABASES.SQLITE) {
        return generatePrismaModels(answers);
    } else if (answers.database === DATABASES.MYSQL) {
        return generateSequelizeModels(answers);
    }
    return '';
}

function generateMongooseModels(answers) {
    return `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
`;
}

function generatePrismaModels(answers) {
    return `// Prisma schema will be generated in schema.prisma
// This is a placeholder for Prisma models

export const prisma = new PrismaClient();
`;
}

function generateSequelizeModels(answers) {
    return `import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});
`;
}
