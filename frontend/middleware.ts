import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

const roleRoutes: Record<string, string> = {
  admin: '/admin',
  medico: '/medico',
  recepcionista: '/recepcionista',
  paciente: '/paciente',
};

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8')
    );
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some(r => pathname.startsWith(r));

  // Autenticado a tentar ir a página pública → redireciona para a sua área
  if (token && isPublic) {
    const role = getRoleFromToken(token);
    const dest = role ? roleRoutes[role] ?? '/' : '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Página pública sem token → deixa passar
  if (isPublic) return NextResponse.next();

  // Sem token → login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Tem token — verifica se está na área correcta do seu papel
  const role = getRoleFromToken(token);
  if (role) {
    const correctBase = roleRoutes[role];
    if (correctBase && pathname !== '/' && !pathname.startsWith(correctBase)) {
      // Médico a tentar ir a /admin → redireciona para /medico
      return NextResponse.redirect(new URL(correctBase, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|_next/static|_next/image).*)'],
};