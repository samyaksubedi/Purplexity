import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { envVariables } from './env.config.js';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: envVariables.QDRANT_URL,
  apiKey: envVariables.QDRANT_API_KEY,
  collectionName: 'query_caching',
});

export { vectorStore };
