'use client';

import { useState } from 'react';
import Link from 'next/link';

type Card = { id: string; front: string; back: string };

const RATINGS = [
  { value: 0, label: 'Forgot', color: 'bg-red-500 hover:bg-red-600' },
  { value: 1, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 2, label: 'Good', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { value: 3, label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-600' },
] as const;

export default function ReviewClient({
  deckId,
  deckTitle,
  initialCards,
}: {
  deckId: string;
  deckTitle: string;
  initialCards: Card[];
}) {
  const [queue, setQueue] = useState<Card[]>(initialCards);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState('');

  const total = initialCards.length;
  const current = queue[0];

  async function submitRating(rating: 0 | 1 | 2 | 3) {
    if (!current || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: current.id, rating }),
      });

      if (!res.ok) {
        setError('Could not save review. Try again.');
        return;
      }

      setQueue((q) => q.slice(1));
      setFlipped(false);
      setDone((d) => d + 1);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Empty state: nothing to review at all
  if (total === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">All caught up</h1>
        <p className="text-slate-500 mb-6">
          Nothing is due for review in <strong>{deckTitle}</strong>.
        </p>
        <Link
          href={`/decks/${deckId}`}
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition"
        >
          Back to deck
        </Link>
      </div>
    );
  }

  // Done state: finished the session
  if (!current) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Session complete</h1>
        <p className="text-slate-500 mb-6">
          You reviewed {done} card{done !== 1 ? 's' : ''}.
        </p>
        <Link
          href={`/decks/${deckId}`}
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition"
        >
          Back to deck
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <Link
          href={`/decks/${deckId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Exit
        </Link>
        <span className="text-sm text-slate-500 tabular-nums">
          {done + 1} / {total}
        </span>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-96 flex flex-col items-center justify-center p-8 text-center cursor-pointer select-none hover:shadow-md transition"
      >
        {!flipped ? (
          <>
            <div className="text-xs font-medium text-slate-400 mb-4 tracking-wider">
              QUESTION
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              {current.front}
            </div>
            <div className="text-xs text-slate-400 mt-8">
              Click anywhere to reveal
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-medium text-emerald-600 mb-4 tracking-wider">
              ANSWER
            </div>
            <div className="text-xl text-slate-700 leading-relaxed">
              {current.back}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mt-4">
          {error}
        </div>
      )}

      {flipped ? (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => submitRating(r.value)}
              disabled={submitting}
              className={`${r.color} disabled:opacity-50 text-white font-medium py-3 rounded-lg transition`}
            >
              {r.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition"
        >
          Show answer
        </button>
      )}
    </div>
  );
}