import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  const isPublic = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redireciona utilizadores autenticados que tentam aceder a páginas públicas de auth
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Permite acesso a rotas públicas (apenas sem token)
  if (isPublic) {
    return NextResponse.next();
  }

  // Se não tem token, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
