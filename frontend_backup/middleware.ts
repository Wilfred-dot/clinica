import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

const roleRoutes: Record<string, string> = {
  admin: '/admin',
  medico: '/medico',
  recepcionista: '/recepcionista',
  paciente: '/paciente',
};

interface JWTPayload {
  role?: string;
  exp?: number;
}

/**
 * Decodifica e valida a estrutura/expiração do JWT no Edge Runtime.
 */
function parseAndValidateToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload: JWTPayload = JSON.parse(jsonPayload);
    
    // Validação de Expiração (Segurança contra Tokens Antigos)
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= payload.exp) {
        console.warn('Token expirado detetado no middleware.');
        return null; // Trata token expirado como inválido/inexistente
      }
    }

    return payload;
  } catch (err) {
    console.error('Erro crítico ao decodificar token no middleware:', err);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Normalização e verificação de rotas públicas
  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));

  // Executa o Parser APENAS UMA VEZ para otimizar CPU
  const tokenPayload = token ? parseAndValidateToken(token) : null;
  const role = tokenPayload?.role;

  // 1. UTILIZADOR AUTENTICADO A TENTAR ENTRAR EM ROTA PÚBLICA
  if (tokenPayload && isPublic) {
    const dest = role ? roleRoutes[role] ?? '/' : '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 2. ROTA PÚBLICA E SEM TOKEN VÁLIDO -> Deixa passar
  if (isPublic) return NextResponse.next();

  // 3. ROTA PRIVADA E SEM TOKEN (OU EXPIRADO) -> Redireciona para Login
  if (!tokenPayload || !role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // Se o token existia mas era inválido/expirado, limpa-o agressivamente com caminhos explícitos
    if (token) {
      response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    }
    return response;
  }

  // 4. CONTROLO DE ACESSO POR PAPEL (RBAC)
  const correctBase = roleRoutes[role];

  if (!correctBase) {
    // Role desconhecida na aplicação -> Força expor utilizador
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    return response;
  }

  // Validação estrita de caminhos para evitar bypass de strings parciais (ex: /medico vs /medico-chefe)
  const isAtCorrectBase = pathname === correctBase || pathname.startsWith(correctBase + '/');

  if (pathname === '/' || !isAtCorrectBase) {
    return NextResponse.redirect(new URL(correctBase, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};