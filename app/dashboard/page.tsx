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
      dueCount: sql<number>`count(case when ${cards.nextReviewAt} <= now() then 1 end)`,
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, session.user.id))
    .groupBy(decks.id, decks.title, decks.createdAt)
    .orderBy(desc(decks.createdAt));

  const totalCards = userDecks.reduce((sum, d) => sum + Number(d.cardCount), 0);
  const totalDue = userDecks.reduce((sum, d) => sum + Number(d.dueCount), 0);
  const deckCount = userDecks.length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl text-slate-900 mb-1">Your decks</h1>
        <p className="text-slate-500 text-sm">{session.user.email}</p>
      </div>

      {/* Stats row */}
      {deckCount > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Decks" value={deckCount} />
          <StatCard label="Cards" value={totalCards} />
          <StatCard
            label="Due now"
            value={totalDue}
            accent={totalDue > 0}
          />
        </div>
      )}

      {/* Decks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-slate-900">Decks</h2>
        <Link
          href="/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-soft hover:shadow-card transition-all"
        >
          + New deck
        </Link>
      </div>

      {userDecks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-soft">
          <h3 className="text-lg text-slate-900 mb-2">No decks yet</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Paste your first set of notes and let AI turn them into flashcards.
          </p>
          <Link
            href="/new"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
          >
            Create your first deck
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {userDecks.map((deck) => {
            const due = Number(deck.dueCount);
            return (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-soft hover:shadow-card hover:border-indigo-200 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg text-slate-900 mb-1">
                      {deck.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {deck.cardCount} card{Number(deck.cardCount) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {due > 0 ? (
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-100">
                      {due} due
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">all caught up</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div
        className={`text-3xl ${
          accent ? 'text-indigo-600' : 'text-slate-900'
        } font-mono tabular-nums`}
      >
        {value}
      </div>
    </div>
  );
}