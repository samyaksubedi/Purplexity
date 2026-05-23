import { envVariables } from '../Configs/env.config.js';
import { ApiError } from '../UTILS/API/error.api.js';
import { logger } from '../Configs/logger.config.js';
import jwt from 'jsonwebtoken';

const authenticateUser = async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Request with missing or malformed authorization header', {
        path: req.path,
      });
      return res.status(401).json(new ApiError(401, 'No token provided'));
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    // 3. Verify token
    const decoded = jwt.verify(token, envVariables.ACCESS_TOKEN_SECRET);

    // 4. Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    // 5. Continue
    next();
  } catch (error) {
    logger.warn('Invalid or expired token used', {
      error: error.message,
      path: req.path,
    });
    return res.status(401).json(new ApiError(401, 'Invalid or expired token'));
  }
};

export { authenticateUser };
