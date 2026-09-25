import { auth } from '@/lib/auth/config';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { decks, cards } from '@/lib/db/schema';

export default async function DeckDetailPage({
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

  const deckCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deck.id));

  const now = new Date();
  const dueCount = deckCards.filter(
    (c) => c.nextReviewAt <= now
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{deck.title}</h1>
          <p className="text-slate-500 text-sm mb-4">
            {deckCards.length} card{deckCards.length !== 1 ? 's' : ''} ·{' '}
            {dueCount > 0 ? (
              <span className="text-indigo-600 font-medium">{dueCount} due now</span>
            ) : (
              <span>nothing due</span>
            )}
          </p>

          {dueCount > 0 ? (
            <Link
              href={`/decks/${deck.id}/review`}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition"
            >
              Start review ({dueCount})
            </Link>
          ) : (
            <button
              disabled
              className="bg-slate-200 text-slate-500 font-medium px-5 py-2 rounded-lg cursor-not-allowed"
            >
              All caught up
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">All cards</h2>
          <div className="space-y-3">
            {deckCards.map((card, i) => (
              <div
                key={card.id}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50"
              >
                <div className="text-xs font-medium text-indigo-600 mb-1">
                  CARD {i + 1}
                </div>
                <div className="font-medium text-slate-900 mb-2">{card.front}</div>
                <div className="text-sm text-slate-600">{card.back}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}