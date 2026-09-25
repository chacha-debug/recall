import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-4">
          Turn notes into
          <br />
          <span className="text-indigo-600">mastery.</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
          Paste your study material. Get flashcards. Let AI and spaced repetition
          handle the rest. Built for students who want to actually remember what
          they study.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Get started — it's free
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-6 py-3 rounded-lg transition"
          >
            Sign in
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-20 text-left">
          {[
            {
              title: '1. Paste anything',
              body: 'Notes, textbook excerpts, lecture summaries. 50 to 20,000 characters.',
            },
            {
              title: '2. AI generates cards',
              body: 'Groq LLM reads your text and creates focused question-and-answer cards.',
            },
            {
              title: '3. Review daily',
              body: 'SM-2 spaced repetition schedules each card at the optimal time to remember.',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}