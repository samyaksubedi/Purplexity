import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  // minimum level to log
  // in production → 'info' (skips debug logs)
  // in development → 'debug' (logs everything)
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // format for log files → structured JSON
  format: combine(timestamp(), json()),

  // where logs go
  transports: [
    // errors only → saved permanently to file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // everything → saved permanently to file
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// in development → also log to console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(), // adds colors per level
        simple(), // readable format instead of JSON
      ),
    }),
  );
}

export { logger };
