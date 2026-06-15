# Purplexity - AI Search Platform


## Project Overview 

**Purplexity** is a full-stack AI-Powered search platform that is inspired from **Perplexity AI**. It provides modern and context aware answers by combining modern AI capabilities with the help of Efficient Backend architecture .

## Motivation 
Just randomly thought how perplexity AI works behind the secne ? And I tried to reverse engineer it's whole backend system in a small scale where my brain can proces haha.

## What is it and what can it do ?

A **conversational AI search engine** that :
- Accepts queries from users in natural language
- Searches the web in real-time for relevant information 
- Uses LLM (OpenAI) to synthesize answers 
- It maintains message history per conversation for context-aware follow-ups
- Provide source citations for all answers
- Implement intelligent semantic caching to optimize performance


### Interesting Features 
#### 1. **Semantic Query Caching** 
##### Lets understand this technique from a example :
![alt text](/README-ASSETS/image.png)

##### User 1 asked : **Can you tell me about Hackclub Horizons 2026 ? ?** in the chat , It understands what kind of query is it and if it is cachable query , like the query which meaning remains same / similar for long time  , If so ,It runs whole AI pipeline and  It cache the final response for that query in Qdrant .You can see inthe screenshot that it took around 15 seconds to reply.
![alt text](/README-ASSETS/image2.png)

##### Now Again User 2 asks **What is Hackclub Horizons 2026?** , You can see the meaning of the User 1 query and User 2 query is same , Now it check cache in semantic way if cache hits , it returns the previously generated response and skips the rest AI pipeline else run the whole AI pipeline, You can see in the Screen shot that the response for second query is just 2 seconds , just because of cache hit   .    

#### 2. **Intelligent Query Processing**
 ##### Lets understand this from a example : 
 ##### For a AI Web Search like this what normal people thinks , AI takes the user query , perform a web search with the same query using web search API's and pass the web search result with the query to AI and AI makes the response and the response get's send back to the user . But this is very ineffiicient way , We can get many problems ,and while making this project I faced many problems , like what if user asks many questions in a single query like ***Who is the PM of Nepal ?  And when did he visited to India ?  and When does world cup starts ?*** in a single prompt then web search will hallucinate so we analyze the initail prompt and break down it into 3 sub prompts (sub queries) which are related to main query and fire 3 web searches for all 3 sub queries , so It can extract all answer from the web to the query which user asked . 
#### 3.**Follow-up Questions**
![alt text](/README-ASSETS/image3.png)
##### My backend auto recommends related follow up question based on the last query and it's response. So user can click on it and get the answer automatically. 

### Features
- Rate Limitation on /api/ask endpoint : So user can't brute force the endpoint and empty my AI credits 
- Conversation Management : Create , Update , Delete Conversations 
- User Authentication : JWT based auth ,  secure password hashing with bcrypt , Email Verification System



## Tech Used

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


### AI Uses
- **chatGPT and Claude** -> I used them just for understanding logics which were unclear to me and for designing some of the frontend components   

### Infrastructure
- **Containerization**: Docker Compose


