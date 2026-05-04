'use client';

import { useState } from 'react';
import { forgotPassword } from '@/lib/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const resp = await forgotPassword(email);
      setMessage(resp.message);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Recuperar Senha</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </main>
  );
}
