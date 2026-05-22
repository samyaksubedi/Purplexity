import { app } from './app.js';
import { loadEnv, envVariables } from './Configs/env.config.js';
import { verifyMailTransporter } from './Configs/mail.config.js';
import { connectPostgres } from './Configs/postgres.config.js';
import { connectQdrant } from './Configs/qdrant.config.js';
import { connectRedis } from './Configs/redis.config.js';
// import { connectWhatsApp } from './Configs/whatsapp.config.js';

const PORT = envVariables.PORT || 3000;

async function startServer() {
  await loadEnv();
  await connectPostgres();
  await connectQdrant();
  await connectRedis();
  // await connectWhatsApp();
  verifyMailTransporter();
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer();
