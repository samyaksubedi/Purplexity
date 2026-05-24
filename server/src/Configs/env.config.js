import dotenv from 'dotenv';
dotenv.config();
const loadEnv = async () => {
  console.log('ENV loaded successfully');
};

const envVariables = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  PORT: process.env.PORT,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  GMAIL_USER: process.env.GMAIL_USER,
  CLIENT_URL: process.env.CLIENT_URL,
  SERVER_URL: process.env.SERVER_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  QDRANT_URL: process.env.QDRANT_URL,
  NODE_ENV: process.env.NODE_ENV,
};

export { envVariables, loadEnv };
