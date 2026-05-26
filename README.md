# Perplexity Clone - AI Search Platform

## 📋 Project Overview

**Perplexity Clone** is a full-stack AI-powered search platform that mirrors the functionality of Perplexity AI. It combines modern web technologies with advanced AI capabilities to provide intelligent, context-aware answers by leveraging real-time web search, semantic caching, and large language models (LLMs).

### What is it?

A **conversational AI search engine** that:
- Accepts natural language queries from users
- Searches the web in real-time for relevant information
- Uses OpenAI's language models to synthesize answers
- Maintains conversation history for context-aware follow-ups
- Provides source citations for all answers
- Implements intelligent semantic caching to optimize performance

### 🎯 Key Features

#### 1. **Semantic Query Caching**
   - **Smart Classification**: Every query is automatically classified into three categories:
     - `personal`: User-specific queries (e.g., "Show my profile")
     - `global-cacheable`: General knowledge questions (e.g., "What is JWT?")
     - `global-dynamic`: Time-sensitive queries (e.g., "Latest AI news")
   - **Intelligent Caching**: Only `global-cacheable` queries are cached using Qdrant vector database
   - **Similarity Matching**: Uses semantic embeddings to match similar queries (85% threshold) and return cached results
   - **30-Day TTL**: Cached responses automatically expire after 30 days
   - **Performance Boost**: Eliminates web search and LLM calls for repeated similar queries

#### 2. **Intelligent Query Processing**
   - **Query Breakdown**: Converts user query into 3 specific sub-queries for comprehensive search coverage
   - **Parallel Web Search**: Executes multiple web searches simultaneously using Tavily API
   - **Deduplication**: Automatically removes duplicate URLs and content across search results
   - **Context-Aware**: Maintains conversation history (last 7 messages) for follow-up understanding

#### 3. **Conversation Management**
   - Create, retrieve, and delete conversations
   - Full message history with timestamps
   - Source tracking for all answers
   - Automatic conversation sorting (latest active first)

#### 4. **User Authentication**
   - JWT-based authentication with refresh tokens
   - Secure password hashing with bcrypt
   - Email verification system
   - Role-based access control

---

## 🔄 Ask Controller Flow Diagram

The `/api/ask` endpoint is the core of the platform. Here's the complete flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER SUBMITS QUERY                                                          │
│ (query + optional conversationId)                                           │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. VALIDATE REQUEST                                                         │
│ - Authenticate user (JWT token)                                             │
│ - Validate query is not empty                                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CONVERSATION HANDLING                                                    │
│ - If conversationId provided: Fetch existing conversation                   │
│ - If not: Create new conversation with query title (first 50 chars)         │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. PERSIST USER MESSAGE                                                     │
│ - Save user query to database                                               │
│ - Mark as MessageRole.User                                                  │
│ - Link to conversation                                                      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. CLASSIFY QUERY                                                           │
│ - LLM classifies query into:                                                │
│   • "personal" (user-specific)                                              │
│   • "global-cacheable" (general, stable knowledge)                          │
│   • "global-dynamic" (time-sensitive)                                       │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
        Is cacheable?                      Not cacheable
        (global-cacheable)                 (personal/dynamic)
                    │                         │
                    ▼                         │
        ┌──────────────────────┐            │
        │ 5A. CHECK CACHE      │            │
        │ (Qdrant Vector DB)   │            │
        │ Semantic similarity  │            │
        │ search (>85%)        │            │
        └──────────┬───────────┘            │
                   │                         │
        ┌──────────┴──────────┐             │
        │                     │              │
    CACHE HIT            CACHE MISS          │
        │                     │              │
        ▼                     ▼              ▼
    ┌────────┐       ┌────────────────────────────────────┐
    │ SKIP   │       │ 5B. FETCH CONVERSATION CONTEXT      │
    │ SEARCH │       │ - Get last 7 messages               │
    │ & LLM  │       │ - For follow-up awareness           │
    │        │       └──────────────┬─────────────────────┘
    │        │                      │
    │        │                      ▼
    │        │       ┌──────────────────────────────────────┐
    │        │       │ 6. GENERATE SUB-QUERIES              │
    │        │       │ - Break query into 3 specific Q's    │
    │        │       │ - For comprehensive coverage         │
    │        │       └──────────────┬─────────────────────┘
    │        │                      │
    │        │                      ▼
    │        │       ┌──────────────────────────────────────┐
    │        │       │ 7. PARALLEL WEB SEARCH               │
    │        │       │ - Execute 3 Tavily searches in       │
    │        │       │   parallel (Promise.all)             │
    │        │       │ - Faster than sequential             │
    │        │       └──────────────┬─────────────────────┘
    │        │                      │
    │        │                      ▼
    │        │       ┌──────────────────────────────────────┐
    │        │       │ 8. EXTRACT & DEDUPLICATE             │
    │        │       │ - Merge results from all searches    │
    │        │       │ - Remove duplicate URLs/content      │
    │        │       │ - Using JavaScript Sets              │
    │        │       └──────────────┬─────────────────────┘
    │        │                      │
    │        │                      ▼
    │        │       ┌──────────────────────────────────────┐
    │        │       │ 9. GENERATE FINAL ANSWER             │
    │        │       │ - Feed to OpenAI LLM with:           │
    │        │       │   • Web search results               │
    │        │       │   • Conversation context             │
    │        │       │   • User query                       │
    │        │       │ - Returns { answer, followUps }      │
    │        │       └──────────────┬─────────────────────┘
    │        │                      │
    └────────┼──────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 10. PERSIST ASSISTANT MESSAGE                                               │
│ - Save LLM response to database                                             │
│ - Mark as MessageRole.Assistant                                             │
│ - Save source URLs                                                          │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 11. CONDITIONAL CACHING                                                     │
│ - If query was "global-cacheable":                                          │
│   • Store in Qdrant vector database                                         │
│   • Set 30-day expiration                                                   │
│ - If "personal" or "global-dynamic": Skip caching                           │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 12. UPDATE CONVERSATION                                                     │
│ - Bump conversation updatedAt timestamp                                     │
│ - Sorts conversation to top of sidebar                                      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ RETURN RESPONSE                                                             │
│ {                                                                           │
│   llmResponse: { answer, followUps },                                       │
│   sources: [...URLs...],                                                    │
│   conversationId: "..."                                                     │
│ }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Flow Points:
- **Early Exit on Cache Hit**: If query is cached and similarity score ≥ 85%, entire pipeline is skipped
- **Parallel Processing**: Web searches happen simultaneously, not sequentially
- **Smart Caching**: Only stable, general-knowledge answers are cached
- **Context Continuity**: Conversation history is maintained for follow-up questions
- **Source Tracking**: Every answer includes citations from original sources

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Vector DB**: Qdrant (semantic caching)
- **Cache**: Redis (session management)
- **AI/LLM**: OpenAI (GPT models)
- **Web Search**: Tavily API
- **Authentication**: JWT + bcrypt
- **Logging**: Winston
- **Email**: Nodemailer

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Zustand
- **UI**: Custom components with Tailwind

### Infrastructure
- **Containerization**: Docker Compose

---

## 📦 Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (running locally or remote)
- **Qdrant** (running locally or remote)
- **Redis** (running locally or remote)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Purplexity
```

---

## 🖥️ Backend Setup (Server)

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI API Key (for LLM responses)
OPENAI_API_KEY=your_openai_api_key_here

# Tavily API Key (for web search)
TAVILY_API_KEY=your_tavily_api_key_here

# Client URL (frontend address)
CLIENT_URL=http://localhost:5173

# Server URL (backend address)
SERVER_URL=http://localhost:3000

# PostgreSQL Database Connection
DATABASE_URL=postgresql://username:password@localhost:5432/perplexity_db
DIRECT_URL=postgresql://username:password@localhost:5432/perplexity_db

# Gmail Configuration (for email verification)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# JWT Secret (generate a strong random string)
ACCESS_TOKEN_SECRET=your_super_secret_jwt_key_here

# Redis Connection URL
REDIS_URL=redis://localhost:6379

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# Environment
NODE_ENV=development
```

### Step 4: Setup Database

Run Prisma migrations to create database tables:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

### Step 5: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on **http://localhost:3000**

✅ You should see:
```
Server running on port 3000
API endpoints available at http://localhost:3000/api
```

---

## 🎨 Frontend Setup (Client)

### Step 1: Navigate to Client Directory
```bash
cd ../client
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

Edit `.env` with your API endpoint:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 4: Start the Development Server

```bash
npm run dev
```

The client will start on **http://localhost:5173**

✅ You should see:
```
  Local:        http://localhost:5173/
  press h + enter to show help
```

### Other Frontend Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

---

## 🔑 Environment Variables Reference

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM | `sk-...` |
| `TAVILY_API_KEY` | Tavily API key for web search | `tvly-...` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |
| `SERVER_URL` | Backend URL | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/db` |
| `DIRECT_URL` | Direct DB connection for migrations | `postgresql://user:pass@localhost/db` |
| `GMAIL_USER` | Gmail address for sending emails | `your@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app-specific password | `xxxx xxxx xxxx xxxx` |
| `ACCESS_TOKEN_SECRET` | JWT secret key | `your_secret_key` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `QDRANT_URL` | Qdrant vector DB URL | `http://localhost:6333` |
| `QDRANT_API_KEY` | Qdrant API key | `your_qdrant_key` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Client (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:3000/api` |

---

## 🗄️ External Services Setup

### PostgreSQL Database

If running locally, start PostgreSQL:

```bash
# macOS (using Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows (using WSL or PostgreSQL installer)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

Create the database:

```bash
psql -U postgres
CREATE DATABASE perplexity_db;
\q
```

### Redis

Start Redis server:

```bash
# macOS (using Homebrew)
brew services start redis

# Linux
sudo systemctl start redis-server

# Windows (using WSL)
redis-server
```

### Qdrant Vector Database

Option 1: Using Docker (Recommended)

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest
```

Option 2: Local Installation

Visit: https://qdrant.tech/documentation/quick-start/

---

## 🚀 Running Everything Together

### Using Docker Compose (Recommended)

The project includes a `docker-compose.yml` for PostgreSQL, Redis, and Qdrant:

```bash
cd server
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Qdrant** on ports 6333/6334

Then follow the server and client setup steps above.

### Manual Setup (All Services Separate)

1. Start PostgreSQL
2. Start Redis
3. Start Qdrant
4. Run `npm run dev` in server directory
5. Run `npm run dev` in client directory

---

## 🧪 Testing the Application

### Health Check

Test if the server is running:

```bash
curl http://localhost:3000/api/health-check
```

Expected response:
```json
{"message": "Server is serving"}
```

### Using Postman

The `postman` folder includes API request collections:

1. Import the Postman collection
2. Set the base URL to `http://localhost:3000`
3. Test endpoints for:
   - Authentication (signup, signin, verify)
   - Conversations (get, create, delete)
   - Ask (submit query)

---

## 📁 Project Structure

```
Purplexity/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components (Home, SignIn, SignUp)
│   │   ├── api/              # API client (axios)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state management
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Frontend dependencies
│   └── .env                  # Environment variables
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── Controllers/      # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── conversation.controller.js (contains ask function)
│   │   │   └── user.controller.js
│   │   ├── Services/         # Business logic
│   │   │   ├── cache.service.js (Semantic caching)
│   │   │   ├── query.service.js (Classification & sub-queries)
│   │   │   ├── websearch.service.js (Tavily integration)
│   │   │   ├── llm_context.service.js
│   │   │   └── ... (other services)
│   │   ├── Routers/          # Route definitions
│   │   │   ├── auth.router.js
│   │   │   ├── conversation.router.js
│   │   │   └── user.router.js
│   │   ├── Configs/          # Configuration files
│   │   │   ├── llm.config.js
│   │   │   ├── postgres.config.js
│   │   │   ├── qdrant.config.js
│   │   │   ├── redis.config.js
│   │   │   └── ... (other configs)
│   │   ├── Prompts/          # LLM prompt templates
│   │   ├── Schemas/          # Request validation (Zod)
│   │   ├── Middlewares/      # Express middlewares
│   │   ├── UTILS/            # Utility functions
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── prisma/               # Database schema
│   ├── package.json          # Backend dependencies
│   ├── .env                  # Environment variables
│   └── docker-compose.yml    # Docker services
│
├── postman/                   # Postman API collections
├── README.md                  # This file
└── app-logo.png              # Project logo
```

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Password Hashing**: Bcrypt with salting
- **CORS**: Configured to only allow requests from the frontend
- **Helmet**: HTTP header security middleware
- **Rate Limiting**: Can be added to prevent abuse
- **Input Validation**: Zod schemas for request validation
- **Environment Secrets**: Sensitive data in `.env` files (not in version control)

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate dev`

### Redis connection errors
- Ensure Redis is running on port 6379
- Check `REDIS_URL` format

### Qdrant connection errors
- Verify Qdrant is accessible at `QDRANT_URL`
- Check API key if required

### Port already in use
```bash
# Kill process on port 3000 (server)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (client)
lsof -ti:5173 | xargs kill -9
```

### CORS errors
- Ensure `CLIENT_URL` in server `.env` matches your frontend URL
- Default: `http://localhost:5173`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/refresh-token` - Refresh JWT token

### Conversations
- `POST /api/ask` - Submit query and get AI response
- `GET /api/conversations` - Get all user conversations
- `GET /api/conversation/:conversationId` - Get conversation details
- `DELETE /api/conversation/:conversationId` - Delete conversation

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

---

## 📝 Performance Optimizations

1. **Semantic Caching**: Reduces API calls for repeated similar queries
2. **Parallel Web Search**: 3 searches in parallel instead of sequential
3. **Deduplication**: Removes duplicate data before sending to LLM
4. **Lazy Loading**: Frontend loads conversations on demand
5. **Database Indexing**: Prisma optimized queries
6. **Compression**: Gzip compression on responses

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License

ISC License - Author: Samyak Raj Subedi

---

## 🔗 Resources

- [LangChain Documentation](https://js.langchain.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tavily Search API](https://tavily.com/)
- [Qdrant Vector Database](https://qdrant.tech/)
- [Prisma ORM](https://www.prisma.io/)
- [Express.js](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## ✨ Features Roadmap

- [ ] Rate limiting
- [ ] Image search integration
- [ ] Custom LLM model selection
- [ ] Conversation sharing
- [ ] API key management
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app

---

## 📧 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Happy Searching! 🚀**
