import { prisma } from '../Configs/postgres.config.js';
import {
  sendResendVerificationEmail,
  sendWelcomeEmail,
} from '../Services/email.service.js';
import { ApiError } from '../UTILS/API/error.api.js';
import { ApiResponse } from '../UTILS/API/response.api.js';
import { comparePassword, hashPassword } from '../UTILS/hash.util.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
} from '../UTILS/token.util.js';
import { logger } from '../Configs/logger.config.js';

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      logger.warn('Signup attempt with existing email', { email });
      return res
        .status(400)
        .json(new ApiError(400, 'User already exists with this email'));
    }
    const hashedPassword = await hashPassword(password);
    const { token, expires } = generateVerificationToken();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: token,
        emailVerificationTokenExpires: expires,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });
    await sendWelcomeEmail({ to: email, name, verificationToken: token });
    logger.info('User registered successfully', { userId: user.id, email });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          'User Registered Successfully! Please check your Email and Verify it.',
        ),
      );
  } catch (error) {
    logger.error('Internal Server Error at /signUp', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error in /signUp'));
  }
};

const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: { gt: new Date() },
      },
    });
    if (!user) {
      logger.warn('Invalid or expired verification token used', { token });
      return res
        .status(400)
        .json(new ApiError(400, 'Verification link expired or invalid'));
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });
    logger.info('User verified successfully', { userId: user.id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'User verified successfully'));
  } catch (error) {
    logger.error('Internal Server Error at /verify', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /verify'));
  }
};

const resendVerificationToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('Resend verification attempted for non-existent email', {
        email,
      });
      return res
        .status(404)
        .json(new ApiError(404, 'User not found with the email'));
    }
    if (user.isVerified) {
      logger.warn('Resend verification attempted for already verified user', {
        email,
      });
      return res
        .status(400)
        .json(new ApiError(400, 'User is already Verified'));
    }
    const { token, expires } = generateVerificationToken();
    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: expires,
      },
    });
    await sendResendVerificationEmail({
      name: user.name,
      to: email,
      verificationToken: token,
    });
    logger.info('Verification email resent', { email });
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, 'Verification email resent, Check your email'),
      );
  } catch (error) {
    logger.error('Internal Server Error at /resend-verification', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /resend-verification'));
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('Sign in attempt with non-existent email', { email });
      return res.status(401).json(new ApiError(401, 'Invalid credentials'));
    }

    // 2. Check if verified
    if (!user.isVerified) {
      logger.warn('Sign in attempt by unverified user', { email });
      return res
        .status(403)
        .json(new ApiError(403, 'Please verify your email first'));
    }

    // 3. Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      logger.warn('Sign in attempt with wrong password', { email });
      return res.status(401).json(new ApiError(401, 'Invalid credentials'));
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expires: refreshTokenExpires } =
      generateRefreshToken();

    // 5. Save refresh token in DB (single device → overwrite)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, refreshTokenExpires },
    });

    // 6. Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // set to true in production (HTTPS)
      sameSite: 'strict',
      expires: refreshTokenExpires,
    });

    logger.info('User signed in successfully', { userId: user.id, email });

    // 7. Return response (NO password)
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
        'User loggedIn successfully',
      ),
    );
  } catch (error) {
    logger.error('Internal Server Error at /signIn', {
      error: error.message,
      stack: error.stack,
    });
    console.log(error.message);
    console.log(error.stack);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /signIn'));
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // set to true in production (HTTPS)
      sameSite: 'strict',
    });
    logger.info('User logged out successfully');
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'User logged Out successfully'));
  } catch (error) {
    logger.error('Internal Server Error at /logout', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /logout'));
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      logger.warn('Refresh attempt without refreshToken cookie');
      return res
        .status(400)
        .json(new ApiError(400, 'refreshToken is missing in cookies!'));
    }
    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpires: { gt: new Date() },
      },
    });
    if (!user) {
      logger.warn('Refresh attempt with invalid or expired refreshToken');
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            'Invalid or Expired refreshToken, Please login again!',
          ),
        );
    }
    const accessToken = generateAccessToken(user);
    logger.info('Access token refreshed successfully', { userId: user.id });
    return res.status(200).json(new ApiResponse(200, { accessToken }));
  } catch (error) {
    logger.error('Internal Server Error at /refresh', {
      error: error.message,
      stack: error.stack,
    });
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /refresh'));
  }
};

export {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logoutUser,
  refresh,
};
