import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config.js';

const prisma = new PrismaClient();

const connectPostgres = async () => {
  try {
    await prisma.$connect();
    logger.info('Postgres connected');
  } catch (error) {
    logger.error('Postgres connection failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

export { prisma, connectPostgres };
