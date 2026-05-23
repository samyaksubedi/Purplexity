import { z } from 'zod';

const askReqBodySchema = z.object({
  query: z.string(),
  conversationId: z.string().uuid().optional(),
});
const getConversationReqParamsSchema = z.object({
  conversationId: z.string().uuid(),
});
const deleteConversationReqParamsSchema = z.object({
  conversationId: z.string().uuid(),
});

export {
  askReqBodySchema,
  getConversationReqParamsSchema,
  deleteConversationReqParamsSchema,
};
