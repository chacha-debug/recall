# Recall

**AI-powered adaptive study assistant that turns your notes into flashcards and schedules reviews using spaced repetition.**

Built with Next.js, TypeScript, Drizzle ORM, and Groq LLM.

## Live Demo

🔗 **https://recall.vercel.app** *(update after deploy)*

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
| LLM | Groq |
| Validation | Zod |
| Deployment | Vercel |

## How It Works

```
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
  Study sessions update
  intervals based on recall
```

## Local Setup

```bash
git clone https://github.com/chacha-debug/recall.git
cd recall
npm install
cp .env.example .env.local
# Edit .env.local and add GROQ_API_KEY and NEXTAUTH_SECRET
npm run db:push
npm run dev
```

Visit http://localhost:3000

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | From https://console.groq.com |
| `NEXTAUTH_SECRET` | Random 32-byte hex string |
| `NEXTAUTH_URL` | `http://localhost:3000` in dev |
| `DATABASE_URL` | `./dev.db` in dev, Postgres URL in prod |

Generate `NEXTAUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Schema

Four tables with cascading deletes on user removal:

| Table | Purpose |
|-------|---------|
| `users` | Email + bcrypt-hashed password |
| `decks` | Belongs to a user, contains source text |
| `cards` | Belongs to a deck, holds SM-2 scheduling fields |
| `reviews` | Audit log of every rating submission |

Deleting a user cascades to their decks, which cascades to their cards, which cascades to their reviews.

## The Spaced Repetition Algorithm

Simplified SuperMemo-2:

```
rating 0 (Forgot) → interval = 1 day, repetitions = 0
rating 1 (Hard)   → ease × 1.05
rating 2 (Good)   → ease × 1.10
rating 3 (Easy)   → ease × 1.15

interval grows: 1 → 6 → 15 → 38 → ...
ease factor floor: 1.3
```

Every rating updates the card's `next_review_at`. When the app calculates "cards due now", it filters `next_review_at <= unixepoch()`.

## Project Structure

```
recall/
├── app/
│   ├── (app)/                 # Protected routes
│   │   ├── dashboard/
│   │   ├── new/
│   │   └── decks/[id]/
│   ├── api/                   # Route handlers
│   │   ├── auth/
│   │   ├── decks/
│   │   ├── generate/
│   │   └── reviews/
│   ├── login/
│   ├── register/
│   └── page.tsx
├── components/
├── lib/
│   ├── auth/                  # NextAuth config + password helpers
│   ├── db/                    # Drizzle schema + client
│   ├── llm/                   # Groq client + generation logic
│   └── srs/                   # SM-2 algorithm
├── proxy.ts                   # Route protection
└── drizzle.config.ts
```

## Security

- Passwords hashed with bcrypt (cost factor 12)
- Sessions stored in signed JWT cookies
- Every API route validates the session before touching data
- Every deck and card query is scoped to the authenticated user — no cross-user access possible
- LLM output is validated with Zod before being stored

## Roadmap

- [x] Auth, DB schema, AI generation, review flow
- [x] Landing page, nav bar, protected routes
- [ ] PDF upload
- [ ] Quiz mode
- [ ] Dashboard analytics
- [ ] Weak area detection
- [ ] Dark mode
- [ ] Automated tests + CI/CD

## Why I Built This

I built Recall to explore how AI, spaced repetition, and data-driven personalisation can be combined into a tool students actually use. It gave me hands-on experience with the Next.js App Router, Drizzle ORM, LLM integration, prompt validation with Zod, custom scheduling algorithms, and full-stack deployment.

## License

MIT
