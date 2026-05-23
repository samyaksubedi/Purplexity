import express from 'express';

import {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logoutUser,
  refresh,
} from '../Controllers/auth.controller.js';
import { validate } from '../Middlewares/validate.middleware.js';
import {
  signUpReqBodySchema,
  signInReqBodySchema,
  resendVerificationTokenReqBodySchema,
} from '../Schemas/auth.schema.js';

const router = express.Router();
router.get('/', (req, res) => {
  res.send('Working !!');
});
router.post('/signUp', validate(signUpReqBodySchema), signUp);
router.post(
  '/resend-verification',
  validate(resendVerificationTokenReqBodySchema),
  resendVerificationToken,
);
router.get('/verify/:token', verifyUser);
router.post('/signIn', validate(signInReqBodySchema), signIn);
router.post('/logout', logoutUser);
router.post('/refresh', refresh);

// router.post('/testGM', testGM);

export default router;
