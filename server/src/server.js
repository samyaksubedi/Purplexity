import { app } from './app.js';
import { loadEnv, envVariables } from './Configs/env.config.js';
import { verifyMailTransporter } from './Configs/mail.config.js';
import { connectPostgres } from './Configs/postgres.config.js';
import { connectQdrant } from './Configs/qdrant.config.js';
import { connectRedis } from './Configs/redis.config.js';
import { logger } from './Configs/logger.config.js';

const PORT = envVariables.PORT || 3000;

async function startServer() {
  await loadEnv();
  await connectPostgres();
  await connectQdrant();
  await connectRedis();
  verifyMailTransporter();
  app.listen(PORT,'0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

startServer();
