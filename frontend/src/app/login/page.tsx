'use client';

import { useState } from 'react';
import { login, getMe } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const user = await getMe();
      loginSuccess(user);
      window.location.href = '/' + user.role;
    } catch (err: any) {
      // Tenta extrair a mensagem de várias formas possíveis
      let message = 'Erro ao fazer login';
      if (err?.message) {
        if (typeof err.message === 'string') {
          message = err.message;
        } else if (typeof err.message === 'object') {
          // NestJS costuma devolver { message: "..." } ou { message: { message: "..." } }
          if (err.message.message) {
            message = typeof err.message.message === 'string'
              ? err.message.message
              : JSON.stringify(err.message.message);
          } else {
            message = JSON.stringify(err.message);
          }
        }
      } else if (err?.response?.status === 401) {
        message = 'Credenciais inválidas ou conta desactivada';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sessão</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="admin@clinica.co.mz"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Esqueceu a senha?
          </Link>
        </p>
      </form>
    </main>
  );
}
