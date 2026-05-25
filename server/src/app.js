import express from 'express';
import conversationRouter from './Routers/conversation.router.js';
import authRouter from './Routers/auth.router.js';
import userRouter from './Routers/user.router.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { envVariables } from './Configs/env.config.js';

const app = express();

app.use(
  cors({
    origin: envVariables.CLIENT_URL, // Vite default port
    credentials: true, // allows cookies (refreshToken)
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.get('/api/health-check', async (req, res) => {
  res.send({ message: 'Server is serving' });
});
app.use('/api', conversationRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

export { app };
