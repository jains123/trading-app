import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard'];
const AUTH_PAGES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Payload sets a cookie named `payload-token` on login
  const token = request.cookies.get('payload-token')?.value;

  // Protect dashboard — redirect to login if no token
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and visiting auth pages, redirect to dashboard
  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
