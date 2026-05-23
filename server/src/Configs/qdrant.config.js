import { QdrantClient } from '@qdrant/js-client-rest';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';

const qdrantClient = new QdrantClient({ url: envVariables.QDRANT_URL });

const connectQdrant = async () => {
  try {
    await qdrantClient.getCollections();
    logger.info('Qdrant connected');
  } catch (error) {
    logger.error('Qdrant connection failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

export { connectQdrant };
