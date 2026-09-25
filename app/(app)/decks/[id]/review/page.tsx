import { auth } from '@/lib/auth/config';
import { redirect, notFound } from 'next/navigation';
import { eq, and, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { decks, cards } from '@/lib/db/schema';
import ReviewClient from './ReviewClient';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect('/login');

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, session.user.id)))
    .limit(1);

  if (!deck) notFound();

  const now = new Date();
  const dueCards = await db
    .select()
    .from(cards)
    .where(and(eq(cards.deckId, deck.id), lte(cards.nextReviewAt, now)))
    .limit(50);

  return (
    <ReviewClient
      deckId={deck.id}
      deckTitle={deck.title}
      initialCards={dueCards.map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
      }))}
    />
  );
}