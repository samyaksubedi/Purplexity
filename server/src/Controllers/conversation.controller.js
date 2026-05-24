import { llm } from '../Configs/llm.config.js';
import { prompt } from '../Prompts/conversation.prompt.js';
import { parallelSearchWeb } from '../Services/websearch.service.js';
import { ApiError } from '../UTILS/API/error.api.js';
import { ApiResponse } from '../UTILS/API/response.api.js';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { getUsersConversationContext } from '../Services/llm_context.service.js';
import { prisma } from '../Configs/postgres.config.js';
// import { MessageRole } from '@prisma/client';
import pkg from '@prisma/client';

const { MessageRole } = pkg;
import {
  classifyQuery,
  generateSubQueries,
} from '../Services/query.service.js';
import { getFromCache, saveToCache } from '../Services/cache.service.js';
import { logger } from '../Configs/logger.config.js';

const parser = new JsonOutputParser();

const ask = async (req, res) => {
  try {
    const { query, conversationId } = req.body;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json(new ApiError(400, 'query is required'));
    }

    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation) {
        return res
          .status(400)
          .json(new ApiError(400, 'Invalid conversationId'));
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          title: query.slice(0, 50),
          userId: userId,
        },
      });
    }

    await prisma.message.create({
      data: {
        content: query,
        conversationId: conversation.id,
        role: MessageRole.User,
      },
    });

    const classifyQueryResponse = await classifyQuery(query);
    logger.debug('Query classified', { query, type: classifyQueryResponse });

    if (classifyQueryResponse === 'global-cacheable') {
      // ─── 4. CHECK Semantic CACHE ─────────────────────────────────────────────────
      // Cache hit → skip the entire pipeline and return instantly
      const cachedResponse = await getFromCache(query);

      if (cachedResponse) {
        logger.info('Cache hit', { query, conversationId: conversation.id });

        // Parse cached data and persist assistant message to DB
        // Even on cache hit, we save to DB for conversation history continuity
        const data = cachedResponse;
        const content = JSON.stringify(data.llmResponse);
        const sources = data.sources;

        await prisma.message.create({
          data: {
            content,
            sources,
            conversationId: conversation.id,
            role: MessageRole.Assistant,
          },
        });

        // Bump conversation updatedAt → rises to top of sidebar
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {},
        });

        // Return cached response with conversationId for client-side tracking
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { ...data, conversationId: conversation.id },
              'AI responded successfully (cached)',
            ),
          );
      }
    }

    logger.info('Cache miss — running full pipeline', { query });

    // ─── 5. FETCH CONVERSATION CONTEXT ───────────────────────────────────────
    // Retrieve last 7 messages from this conversation for follow-up awareness
    // Passed to LLM so it understands what was discussed before
    const rawContext = await getUsersConversationContext(conversation.id, 7);
    const prevContext =
      rawContext.length > 0
        ? rawContext.map((m) => `${m.role}: ${m.content}`).join('\n')
        : 'No previous conversation history.';

    // ─── 6. GENERATE SUB-QUERIES ──────────────────────────────────────────────
    // Break the user query into 3 specific sub-queries
    // Broader coverage = richer context for the final answer
    const subQueries = await generateSubQueries(query);
    logger.debug('Sub-queries generated', { subQueries });

    // ─── 7. PARALLEL WEB SEARCH ───────────────────────────────────────────────
    // Fire all 3 Tavily searches simultaneously using Promise.all()
    // Reduces search time from 3x sequential to 1x parallel
    const parallelWebSearchResults = await parallelSearchWeb(subQueries);

    // ─── 8. EXTRACT + DEDUPLICATE RESULTS ────────────────────────────────────
    // Use Sets to automatically remove duplicate URLs and contents
    // that may appear across different sub-query results
    // Then merge all web contents into one clean string for LLM context
    const sources = new Set();
    const webContents = new Set();
    parallelWebSearchResults.forEach((webSearchResults) => {
      webSearchResults['results'].forEach((result) => {
        sources.add(result['url']);
        webContents.add(result['content']);
      });
    });
    const sourcesArray = [...sources];
    const webContentsArray = [...webContents].join('\n\n---\n\n');

    // ─── 9. GENERATE FINAL ANSWER ─────────────────────────────────────────────
    // Feed merged web context + conversation history + user query to LLM
    // Returns { answer, followUps } as defined in the prompt template
    const chain = prompt.pipe(llm).pipe(parser);
    const llmResponse = await chain.invoke({
      webSearchResults: webContentsArray,
      userQuery: query,
      prevContext: prevContext,
    });

    // ─── 10. PERSIST ASSISTANT MESSAGE ────────────────────────────────────────
    // Save the LLM response + sources to DB for conversation history
    await prisma.message.create({
      data: {
        content: JSON.stringify(llmResponse),
        sources: sourcesArray,
        conversationId: conversation.id,
        role: MessageRole.Assistant,
      },
    });

    // Bump conversation updatedAt → rises to top of sidebar
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {},
    });

    // Only cache if query is classified as "global-cacheable"
    if (classifyQueryResponse === 'global-cacheable') {
      // ─── 11. CACHE THE RESPONSE ───────────────────────────────────────────────
      // Store in Qdrant for 30Days (Logic is in cache.service.js)
      const responseToCache = { llmResponse, sources: sourcesArray };
      await saveToCache(query, responseToCache);
      logger.info('Response cached in Qdrant', { query });
    }

    // ─── 12. RETURN RESPONSE ──────────────────────────────────────────────────
    // Always return conversationId so client can send follow-ups
    // against the same conversation
    logger.info('AI responded successfully', {
      conversationId: conversation.id,
      userId,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          llmResponse,
          sources: sourcesArray,
          conversationId: conversation.id,
        },
        'AI responded successfully',
      ),
    );
  } catch (error) {
    logger.error('Internal Server Error at /ask', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /ask'));
  }
};

// GET /conversations — sidebar list (lightweight, no messages)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }, // latest active conversation first
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        //  no messages — keeps response lightweight
      },
    });
    if (conversations.length == 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], 'No conversations found'));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversations,
          'Conversations fetched successfully',
        ),
      );
  } catch (error) {
    logger.error('Internal Server Error at /conversations', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /conversations'));
  }
};

// GET /conversation/:id — full messages when user clicks a conversation
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Validate conversation exists and belongs to this user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }, // oldest first → natural chat order
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, 'Conversation not found'));
    }

    // Prevent user from accessing another user's conversation
    if (conversation.userId !== userId) {
      logger.warn('Unauthorized conversation access attempt', {
        userId,
        conversationId,
      });
      return res.status(403).json(new ApiError(403, 'Unauthorized'));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, conversation, 'Conversation fetched successfully'),
      );
  } catch (error) {
    logger.error('Internal Server Error at /conversation/:id', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /conversation/:id'));
  }
};

// DELETE /conversation/:id — delete conversation + all its messages (cascade)
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Validate conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json(new ApiError(404, 'Conversation not found'));
    }

    // Prevent user from deleting another user's conversation
    if (conversation.userId !== userId) {
      logger.warn('Unauthorized conversation delete attempt', {
        userId,
        conversationId,
      });
      return res.status(403).json(new ApiError(403, 'Unauthorized'));
    }

    // Delete conversation — cascade deletes all messages automatically
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    logger.info('Conversation deleted', { conversationId, userId });
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Conversation deleted successfully'));
  } catch (error) {
    logger.error('Internal Server Error at DELETE /conversation/:id', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(
        new ApiError(500, 'Internal Server Error at DELETE /conversation/:id'),
      );
  }
};

export { ask, getConversations, getConversation, deleteConversation };
