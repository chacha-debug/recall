import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { eq, and, lte, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { cards, decks, reviews } from '@/lib/db/schema';
import { scheduleNextReview, type Rating } from '@/lib/srs/sm2';

const submitSchema = z.object({
  cardId: z.string().min(1),
  rating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  const { cardId, rating } = parsed.data;

  // Verify the card belongs to a deck owned by this user
  const [card] = await db
    .select({
      id: cards.id,
      easeFactor: cards.easeFactor,
      interval: cards.interval,
      repetitions: cards.repetitions,
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, cardId), eq(decks.userId, session.user.id)))
    .limit(1);

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  const next = scheduleNextReview(
    {
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
    },
    rating as Rating
  );

  // Update the card's scheduling state
  await db
    .update(cards)
    .set({
      easeFactor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      nextReviewAt: next.nextReviewAt,
    })
    .where(eq(cards.id, card.id));

  // Record the review (audit trail)
  await db.insert(reviews).values({
    id: nanoid(),
    cardId: card.id,
    rating,
  });

  return NextResponse.json({
    nextReviewAt: next.nextReviewAt,
    interval: next.interval,
  });
}