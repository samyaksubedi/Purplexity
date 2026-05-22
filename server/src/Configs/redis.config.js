import Redis from 'ioredis';
import { envVariables } from './env.config.js';

const redis = new Redis(envVariables.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true, // don't connect immediately on instantiation
  maxRetriesPerRequest: 1, // fail fast instead of retrying forever
});

// catches connection errors silently without crashing
redis.on('error', (error) => {
  console.error('Redis error ❌', error.message);
});

const connectRedis = async () => {
  try {
    await redis.connect(); // explicitly connect because of lazyConnect: true
    await redis.ping();
    console.log('Redis connected ✅');
  } catch (error) {
    console.error('Redis connection failed ❌', error.message);
    process.exit(1);
  }
};

export { redis, connectRedis };
