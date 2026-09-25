import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Welcome, {session.user.email}
        </h1>
        <p className="text-slate-600">
          You are logged in. Your user ID is: <code className="bg-slate-200 px-2 py-1 rounded text-sm">{session.user.id}</code>
        </p>
      </div>
    </div>
  );
}