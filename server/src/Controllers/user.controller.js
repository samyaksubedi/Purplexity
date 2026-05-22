import { prisma } from '../Configs/postgres.config.js';
import { ApiError } from '../UTILS/API/error.api.js';
import { ApiResponse } from '../UTILS/API/response.api.js';

const getMe = async (req, res) => {
  try {
    const { id, email } = req.user;
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
        name: true,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, user, 'User Fetched Successfully'));
  } catch (error) {
    console.error('Internal Server at /getMe ', error.message);
    return res.status(500).json(new ApiError(500, 'Internal Server at /getMe'));
  }
};

export { getMe };
