import { vectorStore } from '../Configs/vectorStore.config.js';

const SIMILARITY_THRESHOLD = 0.85; // “Only use a cached result if it is at least 85% similar to the current query”

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
  } catch (error) {
    console.error('Error saving to cache:', error.message);
    throw new Error('Failed to save response to cache');
  }
};

const getFromCache = async (query) => {
  try {
    const results = await vectorStore.similaritySearchWithScore(query, 1); // Get the top most similar cached response
    if (results.length === 0) return null; // No cached responses found
    const [mostSimilarDoc, similarityScore] = results[0];
    // Check if the similarity score meets the threshold before returning the cached response and if it's not too old (Cache the value for 30days)
    console.log(`Cache similarity score: ${similarityScore}`);
    if (
      similarityScore >= SIMILARITY_THRESHOLD &&
      Date.now() - mostSimilarDoc.metadata.cachedAt < 30 * 24 * 60 * 60 * 1000
    ) {
      return JSON.parse(mostSimilarDoc.metadata.response); // Return the cached response if it meets the similarity threshold
    }
    return null; // Cached response is not similar enough or is too old, so return null to indicate a cache miss
  } catch (error) {
    console.error('Error retrieving from cache:', error.message);
    throw new Error('Failed to retrieve response from cache');
  }
};

export { saveToCache, getFromCache };
