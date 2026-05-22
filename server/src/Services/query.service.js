// classify + generate sub-queries
import { llm } from '../Configs/llm.config.js';
import { JsonOutputParser } from '@langchain/core/output_parsers';

const parser = new JsonOutputParser();

const classifyQuery = async (query) => {
  const response = await llm.invoke(`
You are a strict query classifier.

TASK:
Classify the given query into EXACTLY ONE of the following categories:

1. "personal"
2. "global-cacheable"
3. "global-dynamic"

RULES:
- Return ONLY one of these exact strings:
  "personal" OR "global-cacheable" OR "global-dynamic"
- Do NOT explain your answer
- Do NOT return anything else
- Be strict and consistent

DEFINITIONS:

1. "personal":
- Requires user-specific data, authentication, or private context
- Depends on identity or personal preferences

Examples:
- "Show my profile"
- "What is my email?"
- "Get my recent orders"
- "Update my password"
- "Best laptop for me"
- "What should I eat today?"

---

2. "global-cacheable":
- General knowledge that is stable over time
- Same answer is useful for many users
- Does NOT depend on time or user

Examples:
- "What is JWT authentication?"
- "Explain LLM"
- "What is Docker?"
- "How does REST API work?"
- "What is the capital of France?"
- "Explain database indexing"

---

3. "global-dynamic":
- General but time-sensitive OR frequently changing
- Answers may become outdated quickly
- Should NOT be cached

Examples:
- "Latest AI news"
- "Current stock price of Tesla"
- "Weather today in Kathmandu"
- "Top trending movies right now"
- "Who won the match today?"
- "Recent tech updates"

---

EDGE CASE RULES:
- If query includes words like: "today", "latest", "current", "now", "recent"
  → classify as "global-dynamic"
- If query is subjective to the user ("for me", "should I", "my preference")
  → classify as "personal"
- If unsure between cacheable and dynamic → prefer "global-dynamic"

---

NOW CLASSIFY:

Query: ${query}
Answer:
  `);

  const result = response.content.trim().toLowerCase().replace(/"/g, '');
  return result; // "personal" | "global-cacheable" | "global-dynamic"
};

const generateSubQueries = async (query) => {
  const subQueriesRawResponse = await llm.invoke(
    `Break down the following query into exactly 3 specific sub-queries for web search.

Rules:
- Return ONLY a raw JSON array of 3 strings
- No markdown, no code fences, no explanation, no preamble
- Each sub-query should be specific and searchable

Example output:
["sub-query 1", "sub-query 2", "sub-query 3"]

Query: ${query}`,
  );

  const subQueries = await parser.invoke(subQueriesRawResponse);
  return subQueries;
};

export { classifyQuery, generateSubQueries };
