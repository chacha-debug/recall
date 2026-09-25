import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Welcome, {session.user.email}
        </h1>

        <Link
          href="/new"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition"
        >
          + New deck
        </Link>

        <p className="text-slate-600 mt-6">
          User ID: <code className="bg-slate-200 px-2 py-1 rounded text-sm">{session.user.id}</code>
        </p>
      </div>
    </div>
  );
}