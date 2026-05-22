import { QdrantClient } from '@qdrant/js-client-rest';
import { envVariables } from './env.config.js';

const qdrantClient = new QdrantClient({ url: envVariables.QDRANT_URL });
const connectQdrant = async () => {
  try {
    await qdrantClient.getCollections();
    console.log('Qdrant connected ✅');
  } catch (error) {
    console.error('Qdrant connection failed ❌', error.message);
    process.exit(1);
  }
};

export { connectQdrant };
