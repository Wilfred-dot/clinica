const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function extractErrorMessage(body: any): string {
  if (typeof body === 'string') return body;
  if (typeof body?.message === 'string') return body.message;
  if (typeof body?.message?.message === 'string') return body.message.message;
  if (typeof body?.message === 'object') return JSON.stringify(body.message);
  return 'Erro ' + (body?.statusCode || '');
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(API_BASE + url, { ...options, headers });

  if (!res.ok) {
if (res.status === 401) {
  localStorage.removeItem('access_token');
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Strict';
  const isPublic = ['/login', '/forgot-password', '/reset-password'].some(p => window.location.pathname.startsWith(p));
  if (typeof window !== 'undefined' && !isPublic) {
    window.location.href = '/login?expired=1';
  }
  // Diferenciar login de outras rotas
  if (url === '/auth/login') {
    // Para login, exibir mensagem de erro real
    const error = await res.json().catch(() => ({ message: 'Erro de rede' }));
    const message = extractErrorMessage(error);
    throw new Error(message || 'Credenciais inválidas');
  } else {
    throw new Error('Sessão expirada. Faça login novamente.');
  }
}
    const error = await res.json().catch(() => ({ message: 'Erro de rede' }));
    const message = extractErrorMessage(error);
    throw new Error(message);
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const data = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('access_token', data.access_token);
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `access_token=${data.access_token}; path=/; max-age=604800; SameSite=Strict${isSecure ? '; Secure' : ''}`;
  return data;
}

export async function getMe() {
  return request<{ id: number; name: string; email: string; role: string }>('/auth/me');
}

export async function forgotPassword(email: string) {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export function logout() {
  localStorage.removeItem('access_token');
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Strict';
  window.location.href = '/login';
}