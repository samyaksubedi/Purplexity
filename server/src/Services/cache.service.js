import { vectorStore } from '../Configs/vectorStore.config.js';
import { logger } from '../Configs/logger.config.js';

const SIMILARITY_THRESHOLD = 0.85; // Only use a cached result if it is at least 85% similar to the current query

const saveToCache = async (query, responseToCache) => {
  // query should be string but LLMresponse can be an object containing the response and sources
  try {
    await vectorStore.addDocuments([
      {
        pageContent: query,
        metadata: {
          response: JSON.stringify(responseToCache), // Store the response as a string in metadata
          cachedAt: Date.now(),
        },
      },
    ]);
    logger.info('Response saved to semantic cache', { query });
  } catch (error) {
    logger.error('Error saving to semantic cache', {
      error: error.message,
      stack: error.stack,
      query,
    });
    throw new Error('Failed to save response to cache');
  }
};

const getFromCache = async (query) => {
  try {
    const results = await vectorStore.similaritySearchWithScore(query, 1); // Get the top most similar cached response
    if (results.length === 0) return null; // No cached responses found

    const [mostSimilarDoc, similarityScore] = results[0];
    logger.debug('Semantic cache similarity score', { query, similarityScore });

    // Check if similarity score meets threshold and if cache is not older than 30 days
    if (
      similarityScore >= SIMILARITY_THRESHOLD &&
      Date.now() - mostSimilarDoc.metadata.cachedAt < 30 * 24 * 60 * 60 * 1000
    ) {
      logger.info('Semantic cache hit', { query, similarityScore });
      return JSON.parse(mostSimilarDoc.metadata.response);
    }

    logger.debug('Semantic cache miss — score too low or cache too old', {
      query,
      similarityScore,
    });
    return null;
  } catch (error) {
    logger.error('Error retrieving from semantic cache', {
      error: error.message,
      stack: error.stack,
      query,
    });
    throw new Error('Failed to retrieve response from cache');
  }
};

export { saveToCache, getFromCache };
