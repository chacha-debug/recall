import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth v5 uses the "authjs" prefix by default
  const sessionToken =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token');

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/decks')) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/decks/:path*'],
};