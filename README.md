# Recall

**AI-powered adaptive study assistant that turns your notes into flashcards and schedules reviews using spaced repetition.**

Built with Next.js, TypeScript, Drizzle ORM, and Groq LLM.

## Live Demo

🔗 [recall-xxxxx.vercel.app](https://recall-xxxxx.vercel.app) *(placeholder — will update after deploy)*

## Features

- **AI flashcard generation** — paste notes, get 5–20 focused question/answer cards
- **Spaced repetition (SM-2)** — each card is scheduled at the optimal review interval
- **Study sessions** — flip cards, rate them Forgot / Hard / Good / Easy
- **Progress tracking** — see how many cards are due today per deck
- **Private by default** — every account can only access their own decks and cards
- **Auth built-in** — email + password with bcrypt hashing

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth v5 (credentials) |
| Database | SQLite (dev) / Postgres (prod) |
| ORM | Drizzle ORM |
| LLM | Groq (Llama / GPT-OSS models) |
| Validation | Zod |
| Deployment | Vercel |

## How It Works

Paste notes
│
▼
Groq LLM generates
structured flashcards
│
▼
Validated with Zod
│
▼
Stored in Postgres
│
▼
SM-2 schedules reviews
│
▼
Study sessions
update intervals

## Screenshots

*(to be added after deploy)*

## Local Setup

```bash
git clone https://github.com/chacha-debug/recall.git
cd recall
npm install
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY and NEXTAUTH_SECRET
npm run db:push
npm run dev
