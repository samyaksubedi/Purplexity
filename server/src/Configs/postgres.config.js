// src/config/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectPostgres = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected ✅');
  } catch (error) {
    console.error('Database connection failed ❌', error.message);
    process.exit(1);
  }
};

export { prisma, connectPostgres };
