import Redis from 'ioredis';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';

const redis = new Redis(envVariables.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true, // don't connect immediately on instantiation
  maxRetriesPerRequest: 1, // fail fast instead of retrying forever
});

// catches runtime connection errors silently without crashing
redis.on('error', (error) => {
  logger.error('Redis runtime error', {
    error: error.message,
    stack: error.stack,
  });
});

const connectRedis = async () => {
  try {
    await redis.connect(); // explicitly connect because of lazyConnect: true
    await redis.ping();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

export { redis, connectRedis };
