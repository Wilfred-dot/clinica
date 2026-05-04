const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
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
    const error = await res.json().catch(() => ({ message: 'Erro de rede' }));
    throw new Error(error.message || 'Erro ' + res.status);
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const data = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('access_token', data.access_token);
  document.cookie = `access_token=${data.access_token}; path=/; max-age=604800`;
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
  document.cookie = 'access_token=; path=/; max-age=0';
  window.location.href = '/login';
}
