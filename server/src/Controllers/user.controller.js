import { prisma } from '../Configs/postgres.config.js';
import { ApiError } from '../UTILS/API/error.api.js';
import { ApiResponse } from '../UTILS/API/response.api.js';
import { logger } from '../Configs/logger.config.js';

const getMe = async (req, res) => {
  try {
    const { id, email } = req.user;
    const user = await prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        isVerified: true,
        name: true,
      },
    });
    logger.info('User fetched successfully', { userId: id, email });
    return res
      .status(200)
      .json(new ApiResponse(200, user, 'User Fetched Successfully'));
  } catch (error) {
    logger.error('Internal Server Error at /getMe', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /getMe'));
  }
};

export { getMe };
