'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: '/dashboard', label: 'Decks' },
    { href: '/new', label: 'New' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href={session ? '/dashboard' : '/'}
          className="text-lg font-bold text-slate-900"
        >
          recall<span className="text-indigo-600">.</span>
        </Link>

        {session && (
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-slate-200 mx-2" />

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
            >
              Sign out
            </button>
          </nav>
        )}

        {!session && (
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg transition"
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}