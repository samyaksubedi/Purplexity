import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  // minimum level to log
  // in production → 'info' (skips debug logs)
  // in development → 'debug' (logs everything)
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  format: combine(timestamp(), json()),

  transports: [
    // ✅ Always log to console
    // Production → JSON format (Railway captures this)
    // Development → colorized readable format
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? combine(timestamp(), json())
          : combine(colorize(), simple()),
    }),
  ],
});

// File transports only in development
// Railway filesystem is ephemeral — files disappear on redeploy
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  );
}

export { logger };
