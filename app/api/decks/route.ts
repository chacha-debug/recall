import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { decks, cards } from '@/lib/db/schema';

const createDeckSchema = z.object({
  title: z.string().min(1).max(200),
  sourceText: z.string().min(50).max(20000),
  cards: z.array(
    z.object({
      front: z.string().min(1).max(500),
      back: z.string().min(1).max(1000),
    })
  ).min(1).max(50),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid deck data' }, { status: 400 });
  }

  const { title, sourceText, cards: cardInput } = parsed.data;
  const deckId = nanoid();

  // Insert deck
  await db.insert(decks).values({
    id: deckId,
    userId: session.user.id,
    title,
    sourceText,
  });

  // Insert cards
  await db.insert(cards).values(
    cardInput.map((c) => ({
      id: nanoid(),
      deckId,
      front: c.front,
      back: c.back,
    }))
  );

  return NextResponse.json({ id: deckId }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, session.user.id))
    .orderBy(desc(decks.createdAt));

  return NextResponse.json({ decks: userDecks });
}