import express, { Router } from 'express';
import {
  ask,
  getConversations,
  getConversation,
} from '../Controllers/conversation.controller.js';
import { validate } from '../Middlewares/validate.middleware.js';
import {
  askReqBodySchema,
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
router.get('/', authenticateUser, getConversations);
router.get(
  '/:conversationId',
  authenticateUser,
  validate(getConversationReqParamsSchema, 'params'),
  getConversation,
);

export default router;
