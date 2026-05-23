import express, { Router } from 'express';
import {
  ask,
  getConversations,
  getConversation,
  deleteConversation,
} from '../Controllers/conversation.controller.js';
import { validate } from '../Middlewares/validate.middleware.js';
import {
  askReqBodySchema,
  deleteConversationReqParamsSchema,
  getConversationReqParamsSchema,
} from '../Schemas/conversation.schema.js';
import { authenticateUser } from '../Middlewares/auth.middleware.js';
import { creditLimiter } from '../Middlewares/credits.middleware.js';

const router = express.Router();

router.post(
  '/ask',
  authenticateUser,
  creditLimiter,
  validate(askReqBodySchema),
  ask,
);
router.get('/conversations', authenticateUser, getConversations);
router.get(
  '/conversation/:conversationId',
  authenticateUser,
  validate(getConversationReqParamsSchema, 'params'),
  getConversation,
);
router.delete(
  '/conversation/:conversationId',
  authenticateUser,
  validate(deleteConversationReqParamsSchema, 'params'),
  deleteConversation,
);
export default router;
