import { prisma } from '../Configs/postgres.config.js';

const getUsersConversationContext = async (
  conversationId,
  nnumberOfLastMessages,
) => {
  //  Fetch last N messages from the database for the user of given conversationId
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: nnumberOfLastMessages,
  });

  return messages.reverse(); // Reverse to get chronological order
};

export { getUsersConversationContext };
