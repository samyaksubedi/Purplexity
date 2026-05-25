import { redis } from '../Configs/redis.config.js';
import { ApiError } from '../UTILS/API/error.api.js';
import { logger } from '../Configs/logger.config.js';

const GLOBAL_LIMIT = 300; // max requests per day across all users
const USER_LIMIT = 40; // max requests per day per user
const TTL = 24 * 60 * 60; // 24 hours in seconds

const creditLimiter = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ─── Global Rate Limit ───
    const globalKey = 'rate_limit:global';
    const globalCount = await redis.incr(globalKey);

    if (globalCount === 1) {
      // First request of the day → set TTL
      await redis.expire(globalKey, TTL);
    }

    if (globalCount > GLOBAL_LIMIT) {
      logger.warn('Global rate limit exceeded', { globalCount, userId });
      return res
        .status(429)
        .json(new ApiError(429, 'Server is busy, please try again tomorrow'));
    }

    // ─── Per User Rate Limit ──────────────────────────────────────────────
    const userKey = `rate_limit:${userId}`;
    const userCount = await redis.incr(userKey);

    if (userCount === 1) {
      // First request of the day for this user → set TTL
      await redis.expire(userKey, TTL);
    }

    if (userCount > USER_LIMIT) {
      logger.warn('User daily limit exceeded', { userId, userCount });
      return res
        .status(429)
        .json(
          new ApiError(
            429,
            `Daily limit of ${USER_LIMIT} queries reached, try again tomorrow`,
          ),
        );
    }

    logger.debug('Rate limit check passed', { userId, userCount, globalCount });
    next(); // passed both checks
  } catch (error) {
    logger.error('Rate limiter error', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1); // Exit the process if Redis is not working, since caching and rate limiting are critical for our app's performance and stability.
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          'Internal error in rate limiter, please try again later',
        ),
      );
  }
};

export { creditLimiter };
