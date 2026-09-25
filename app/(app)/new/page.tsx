'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Card = { front: string; back: string };

export default function NewDeckPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const charCount = text.trim().length;
  const canGenerate = charCount >= 50 && charCount <= 20000 && !generating;

  async function handleGenerate() {
    setError('');
    setGenerating(true);
    setCards(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Generation failed.');
        return;
      }

      setCards(data.cards);
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!cards) return;
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Untitled Deck',
          sourceText: text,
          cards,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not save deck.');
        return;
      }

      const data = await res.json();
      router.push(`/decks/${data.id}`);
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">New deck</h1>
        <p className="text-slate-500 mb-6">
          Paste your notes below. We&apos;ll turn them into flashcards.
        </p>

        {/* Step 1: Input */}
        {!cards && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deck title <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Photosynthesis — Biology"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Paste your notes, a section from a textbook, or any study material..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={charCount < 50 ? 'text-slate-400' : 'text-slate-500'}>
                  {charCount.toLocaleString()} characters
                </span>
                <span className="text-slate-400">50 – 20,000</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-2 rounded-lg transition"
            >
              {generating ? 'Generating flashcards…' : 'Generate flashcards'}
            </button>
          </div>
        )}

        {/* Step 2: Review generated cards */}
        {cards && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Generated {cards.length} cards
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Review them below, then save to start studying.
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cards.map((card, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="text-xs font-medium text-indigo-600 mb-1">
                      CARD {i + 1}
                    </div>
                    <div className="font-medium text-slate-900 mb-2">{card.front}</div>
                    <div className="text-sm text-slate-600">{card.back}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setCards(null); setError(''); }}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 rounded-lg transition"
              >
                Start over
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-2 rounded-lg transition"
              >
                {saving ? 'Saving…' : 'Save deck'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}