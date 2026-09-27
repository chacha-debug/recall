import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Soft glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08), transparent 70%)',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-medium text-slate-600 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Powered by Groq &amp; spaced repetition
          </div>

          <h1 className="text-5xl sm:text-6xl mb-6 leading-[1.05] text-slate-900">
            Turn notes into
            <br />
            <em className="not-italic text-indigo-600">mastery.</em>
          </h1>

          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
            Paste your study material. Get flashcards. Let AI and spaced repetition
            handle the rest.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-card hover:shadow-cardHover transition-all"
            >
              Get started — it&apos;s free
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              title: 'Paste anything',
              body: 'Notes, textbook excerpts, lecture summaries. 50 to 20,000 characters.',
            },
            {
              num: '02',
              title: 'AI generates cards',
              body: 'Groq LLM reads your text and creates focused question-and-answer cards.',
            },
            {
              num: '03',
              title: 'Review daily',
              body: 'SM-2 spaced repetition schedules each card at the optimal time.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="text-xs font-mono text-indigo-600 mb-3">
                {step.num}
              </div>
              <h3 className="text-lg text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}