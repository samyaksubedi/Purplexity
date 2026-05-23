import express from 'express';
import conversationRouter from './Routers/conversation.router.js';
import authRouter from './Routers/auth.router.js';
import userRouter from './Routers/user.router.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true, // allows cookies (refreshToken)
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.get('/api', async (req, res) => {
  res.send({ message: 'Server is serving' });
});
app.use('/api', conversationRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

export { app };
