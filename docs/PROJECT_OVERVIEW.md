# Project Overview — William Peng's Personal Portfolio

## 1. Project Overview

This is a personal computer science portfolio website for William Peng, a student at UC Berkeley studying Computer Science and Economics. The goal of the site is to showcase William's background, projects, and work experience in a way that goes beyond a static resume — giving visitors an interactive way to explore his background and skills.

The site is structured into sections covering his bio, projects, work experience, and education, all presented in a clean, readable layout. The defining feature is an integrated AI chatbot that allows recruiters and visitors to have a real conversation about William's background, rather than hunting through sections manually.

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 using the App Router
- **Language:** TypeScript throughout
- **UI library:** React 19
- **Styling:** Tailwind CSS v4 — no `tailwind.config.ts`; all design tokens are declared in an `@theme {}` block inside `app/globals.css`
- **Font:** Inter, loaded via `next/font/google` and applied as a CSS variable

### Layout
The site uses a three-column fixed layout:
- **Left sidebar** — bio, avatar, and navigation links
- **Main content area** — scrollable sections (About, Projects, Experience, Education)
- **Right panel** — the AI chat interface, always visible

### Backend
- **API layer:** Next.js API routes (serverless functions) — no separate backend server
- **Database:** Supabase, using PostgreSQL with the `pgvector` extension for storing and querying vector embeddings

### AI / ML
- **Inference provider:** Volcengine (ByteDance's cloud platform), accessed via the `openai` SDK pointed at Volcengine's `baseURL`
- **Chat model:** Doubao (ByteDance's LLM), used for generating responses and HyDE hypothetical documents
- **Embedding model:** Doubao embedding model producing 2048-dimensional vectors
- **Streaming:** Vercel AI SDK (`ai@6`, `@ai-sdk/openai@3`) — `streamText()` returns a plain text `ReadableStream` response

### Data Processing
- **Document chunking:** `@langchain/textsplitters` (`RecursiveCharacterTextSplitter`)
- **PDF extraction:** `pdf-parse`
- **Seed script:** `npx tsx scripts/seed.ts`

### Build
- Turbopack (Next.js dev bundler)
- `npm run build` produces a clean production build — static `/` page and a dynamic `/api/chat` serverless route

---

## 3. Why the Chatbot

Static portfolio sites are passive. A visitor lands on the page and has to read through sections to find the answer to a specific question — "Did he use PyTorch?", "What did he do at that internship?", "What's his GPA?". Most visitors won't do that, especially recruiters under time pressure.

A chatbot solves this. Visitors can ask directly:

> *"What did you work on at ByteDance?"*
> *"Do you have experience with distributed systems?"*
> *"What are your strongest programming languages?"*

The chatbot answers conversationally, drawing from William's actual background. No navigation required.

There's also a second motivation: the chatbot is itself a demonstration of technical skill. Building a RAG system from scratch — embedding a knowledge base, running hybrid retrieval, integrating a streaming LLM — is meaningful AI engineering work. Having it live in the portfolio means the project showcases the skill it describes.

---

## 4. How the Chatbot Was Implemented

### 4a. Knowledge Base (Supabase + pgvector)

All portfolio content is stored as text chunks in a `portfolio_chunks` table in Supabase:

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Primary key |
| `content` | `text` | The chunk text |
| `source` | `text` | Origin label (e.g., `"experience"`, `"projects"`) |
| `category` | `text` | Semantic category |
| `embedding` | `vector(2048)` | Doubao embedding |
| `fts` | `tsvector` | Generated column for full-text search |

One important constraint: pgvector's HNSW and IVFFlat indexes are capped at 2000 dimensions. Because the Doubao embedding model produces 2048-dimensional vectors, no approximate-nearest-neighbor index can be used. Instead, retrieval falls back to a sequential scan, which is perfectly adequate at the scale of a personal portfolio (a few hundred chunks).

Two Supabase RPC functions handle retrieval:
- **`match_chunks`** — pure cosine similarity search against the embedding column
- **`match_chunks_hybrid`** — combines vector similarity with BM25 keyword search, merged via Reciprocal Rank Fusion

External documents (such as a resume PDF) can also be ingested by placing them in `docs/` and re-running the seed script.

### 4b. Seeding the Knowledge Base (`scripts/seed.ts`)

The seed script populates `portfolio_chunks` from two sources:

1. **Structured data** — content from `data/experience.ts`, `data/projects.ts`, `data/skills.ts`, and `data/education.ts` is serialized into natural-language text chunks, each tagged with a `source` and `category`.

2. **PDFs** — any `.pdf` files in `docs/` are parsed with `pdf-parse` and split using `RecursiveCharacterTextSplitter` (1000-character chunks with 150-character overlap).

For each chunk, the script calls Volcengine's embedding endpoint to get a 2048-dim vector, then upserts the chunk and its embedding into Supabase.

Run once to initialize, or re-run after updating portfolio content:

```bash
npx tsx scripts/seed.ts
```

### 4c. Retrieval Strategy — Hybrid Search + HyDE

Two techniques improve retrieval quality beyond a plain vector search:

**HyDE (Hypothetical Document Embeddings)**
Before searching, the server asks the LLM to generate a short hypothetical answer (~80 tokens) to the user's question. That hypothetical answer is then embedded and used as the search vector. The intuition: a plausible answer tends to be closer in embedding space to real matching content than the raw question itself. For example, the question *"What ML frameworks has William used?"* might embed differently from a real chunk about PyTorch experience, but a hypothetical answer like *"I've worked extensively with PyTorch and have used it for..."* maps much more directly.

**Hybrid Search (Vector + BM25)**
Retrieval runs two searches in parallel:
- Vector search using the HyDE document embedding (semantic match)
- BM25 keyword search using the raw user query via PostgreSQL's `websearch_to_tsquery`

The results are merged using Reciprocal Rank Fusion — each chunk's rank from both lists is combined into a single score — and the top 8 chunks are returned.

**Follow-up detection**
Short messages (under 60 characters) or messages containing pronouns like "he", "that", or "it" are detected as follow-up questions. In these cases, the previous 3 messages are prepended to the retrieval query to provide context, ensuring the search doesn't lose the thread of a multi-turn conversation.

### 4d. Chat Pipeline (`app/api/chat/route.ts`)

The full pipeline on each request:

1. **Receive** the message history via `POST /api/chat`
2. **Extract** the last user message; detect follow-ups and extend query if needed
3. **Generate** a HyDE hypothetical answer (~80 tokens) using the Doubao chat model
4. **Retrieve** top 8 chunks from Supabase using hybrid search
5. **Format** chunks as `[Source: {source}]\n{content}` blocks
6. **Build** a system prompt that instructs the model to respond as William in first person, conversationally, in under 100 words, without bullet points
7. **Cap** message history at 20 turns to keep the token budget bounded
8. **Stream** the response via `streamText()` → plain text `ReadableStream`
9. **Log** the conversation asynchronously to a `chat_logs` table in Supabase

One SDK-specific detail worth noting: `ai@6` uses `maxOutputTokens` (not `maxTokens`), and `@ai-sdk/openai` v3 does not have a `compatibility` option. The Volcengine client must be instantiated inside the request handler (not at module level) because the `openai` package validates `apiKey` at construction time, which would throw at Next.js build time if done at the top level.

### 4e. Chat UI (`components/ui/ChatPanel.tsx`)

The chat panel is a fixed right sidebar (`w-96`, full viewport height minus navbar height). Key details:

- Streamed responses are read using the browser's native `ReadableStream` API with a `TextDecoder`, appending tokens to the assistant message bubble in real time as they arrive
- **User messages:** right-aligned, blue background
- **Assistant messages:** left-aligned, with a small avatar
- **Loading state:** three bouncing dots while waiting for the first token
- No third-party chat UI library — the component is written from scratch

---

## 5. Critical Files

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Full RAG pipeline — HyDE, hybrid retrieval, streaming response |
| `lib/retrieval.ts` | `embedText()`, `retrieveChunks()`, `retrieveChunksHybrid()` |
| `lib/volcengine.ts` | Lazy singleton for the Volcengine/Doubao AI client |
| `scripts/seed.ts` | Knowledge base ingestion — structured data + PDFs |
| `components/ui/ChatPanel.tsx` | Chat UI — streaming, message rendering |
| `data/` | Portfolio content: experience, education, projects, skills |
| `app/globals.css` | Tailwind v4 `@theme {}` block — all design tokens |
| `types/index.ts` | Shared TypeScript types |
