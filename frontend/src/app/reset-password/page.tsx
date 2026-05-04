'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const resp = await resetPassword(token, newPassword);
      setMessage(resp.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Redefinir Senha</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    </main>
  );
}
