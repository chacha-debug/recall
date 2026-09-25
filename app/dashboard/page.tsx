import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { decks, cards } from '@/lib/db/schema';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userDecks = await db
    .select({
      id: decks.id,
      title: decks.title,
      createdAt: decks.createdAt,
      cardCount: sql<number>`count(${cards.id})`,
      dueCount: sql<number>`count(case when ${cards.nextReviewAt} <= unixepoch() then 1 end)`,
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, session.user.id))
    .groupBy(decks.id, decks.title, decks.createdAt)
    .orderBy(desc(decks.createdAt));

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your decks</h1>
            <p className="text-slate-500 text-sm mt-1">{session.user.email}</p>
          </div>
          <Link
            href="/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            + New deck
          </Link>
        </div>

        {userDecks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-4">
              You don&apos;t have any decks yet.
            </p>
            <Link
              href="/new"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition"
            >
              Create your first deck
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userDecks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {deck.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {Number(deck.dueCount) > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                      {deck.dueCount} due
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}