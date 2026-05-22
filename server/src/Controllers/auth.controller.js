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

// const testGM = async (req, res) => {
//   const { mail, subject, text } = req.body;

//   await sendEmail({ to: mail, subject: subject, text: text });
//   res.send('Sent successfully');
// };
const signUp = async (req, res) => {
  `User submits (name, email, password)
          ↓
   Check if user's email is alr present or not , if alr present throw error response
          ↓
  Hash password (bcrypt)
          ↓
  Generate random token (crypto.randomBytes)
          ↓
  Save user to DB  → { isVerified: false, emailVerificationToken: token, emailVerificationTokenExpires: Date.now() + 24h }
          ↓
  Send email with link → https://yourapp.com/api/auth/verify/<token>
          ↓
  Return 201 → "Check your email"`;

  try {
    const { name, email, password } = req.body;
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (userExists) {
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
    await sendWelcomeEmail({ to: email, name: name, verificationToken: token });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          'User Registered Successfully ! Please check your Email and Verify it.',
        ),
      );
  } catch (error) {
    console.error('Internal Server Error at /signUp ', error.message);
    res.status(500).json(new ApiError(500, 'Internal Server Error in /signUp'));
  }
};
const verifyUser = async (req, res) => {
  `User clicks link → GET /api/auth/verify/:token
        ↓
Find user WHERE emailVerificationToken = token
        AND emailVerificationTokenExpires > Date.now()   ← don't forget expiry check
        ↓
If not found → "Invalid or expired token"
        ↓
Update user → { isVerified: true, emailVerificationToken: null, emailVerificationTokenExpires: null }
        ↓
Return 200 → "Email verified, you can now login"`;

  try {
    const { token } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
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
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'User verified successfully'));
  } catch (error) {
    console.error('Internal Serve Error at /verify ', error.message);
    res.status(500).json(new ApiError(500, 'Internal Server Error at /verify'));
  }
};

const resendVerificationToken = async (req, res) => {
  `POST /api/auth/resend-verification
User submits email
        ↓
Find user by email → if not found → 404
        ↓
Check isVerified === true → if true → "Email already verified" → 400
        ↓
Generate new token (crypto.randomBytes)
        ↓
Update user → { emailVerificationToken: newToken, emailVerificationTokenExpires: Date.now() + 24h }
        ↓
Send email with new link → /api/auth/verify/<newToken>
        ↓
Return 200 → "Verification email resent"`;

  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, 'User not found with the email'));
    }
    const isVerified = user.isVerified;
    if (isVerified) {
      return res
        .status(400)
        .json(new ApiError(400, 'User is already Verified'));
    }
    const { token, expires } = generateVerificationToken();
    await prisma.user.update({
      where: {
        email: email,
      },
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
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          'Verification email resent, Check your email ',
        ),
      );
  } catch (error) {
    console.error(
      'Internal Server Error at /resend-verification ',
      error.message,
    );
    res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /resend-verification'));
  }
};
const signIn = async (req, res) => {
  `User submits (email, password)
        ↓
Find user by email → if not found → 401
        ↓
Check isVerified === true → if false → "Please verify your email first"
        ↓
bcrypt.compare(password, user.password) → if false → 401
        ↓
Generate accessToken (JWT, expires in 15min)
        ↓
Generate refreshToken (random string, expires in 30 days)
        ↓
Save refreshToken + refreshTokenExpires in DB (overwrites old one → single device login)
        ↓
Set cookie → res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' })
        ↓
Return 200 → accessToken + user data (without password)
        ↓
Client uses accessToken for API requests (Authorization: Bearer <accessToken>)
        ↓
When accessToken expires → client sends POST /auth/refresh with refreshToken cookie
        ↓
Server checks refreshToken in DB + verifies refreshTokenExpires
        ↓
If valid → issue new accessToken (user stays logged in silently)
        ↓
If refreshToken expired → user must log in again`;
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json(new ApiError(401, 'Invalid credentials'));
    }

    // 2. Check if verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json(new ApiError(403, 'Please verify your email first'));
    }

    // 3. Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json(new ApiError(401, 'Invalid credentials'));
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expires: refreshTokenExpires } =
      generateRefreshToken();

    // 5. Save refresh token in DB (single device → overwrite)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpires,
      },
    });

    // 6. Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // set false in dev if not using HTTPS
      sameSite: 'strict',
      expires: refreshTokenExpires,
    });

    // 7. Return response (NO password)
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        'User loggedIn successfully',
      ),
    );
  } catch (error) {
    console.error('Internal Server Error at /signIn  :', error.message);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at /signIn'));
  }
};

const logoutUser = async (req, res) => {
  `POST /api/auth/logout
        ↓
res.clearCookie('token')
        ↓
Return 200 → "Logged out"`;
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // set false in dev if not using HTTPS
      sameSite: 'strict',
    });
    res
      .status(200)
      .json(new ApiResponse(200, {}, 'User logged Out successfully'));
  } catch (error) {
    console.error('Internal Server Error at /logout ', error.message);
    res.status(500).json(new ApiError(500, 'Internal Server Error at /logout'));
  }
};

const refresh = async (req, res) => {
  `Client sends POST /auth/refresh (refreshToken is automatically sent via HTTP-only cookie)
        ↓
Extract refreshToken from req.cookies → if not present → 401
        ↓
Find user by refreshToken in DB → if not found → 401 (invalid session)
        ↓
Check refreshTokenExpires > current time → if expired → 401 (session expired, login required)
        ↓
(Optional but recommended) Verify token integrity if using hashed tokens
        ↓
Generate new accessToken (JWT, expires in 15min)
        ↓
(Optional advanced) Generate new refreshToken and update DB (token rotation)
        ↓
Return 200 → new accessToken
        ↓
Client replaces old accessToken and continues making API requests
        ↓
User never notices unless refreshToken is expired`;
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(400)
        .json(new ApiError(400, 'refreshToken is missing in cookies !'));
    }
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
        refreshTokenExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            'Invalid or Expired refreshToken , Please login again !',
          ),
        );
    }
    const accessToken = generateAccessToken(user);
    return res.status(200).json(new ApiResponse(200, { accessToken }));
  } catch (error) {
    console.error('Internal Server Error at /refresh ', error.message);
    return res
      .status(500)
      .json(new ApiError(400, 'Internal Server Error at /refresh'));
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
