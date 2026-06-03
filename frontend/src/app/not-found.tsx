'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Token de recuperação inválido ou ausente. Solicite um novo link.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas introduzidas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A nova senha deve conter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const resp = await resetPassword(token, newPassword);
      setMessage(resp.message || 'Senha redefinida com sucesso. A redirecionar para o login...');
      setTimeout(() => router.replace('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao redefinir a senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Nova senha</label>
        <input
          type="password"
          className="form-input"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          disabled={loading || !token}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Confirmar nova senha</label>
        <input
          type="password"
          className="form-input"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repita a nova senha"
          required
          disabled={loading || !token}
        />
      </div>

      {!token && (
        <div className="alert-error" style={{ background: 'var(--warn-dim)', color: 'var(--warn)', borderLeftColor: 'var(--warn)' }}>
          Aviso: Nenhum token detetado. Não poderá submeter este formulário.
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <button type="submit" disabled={loading || !token} className="btn-submit">
        {loading ? 'A guardar alterações...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-sidebar-grid" />
        <div className="auth-sidebar-glow" />
        <div style={{ position: 'relative' }}>
          <div className="auth-sidebar-icon-box">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--mmq-orange)" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="auth-sidebar-title">
            Defina uma<br />nova senha<br /><em style={{ fontStyle: 'italic', color: 'var(--mmq-orange)' }}>segura</em>
          </h1>
          <p className="auth-sidebar-text">
            A sua senha deve ter no mínimo 8 caracteres, incluindo uma estrutura complexa para manter os dados clínicos protegidos.
          </p>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-form-wrapper">
          <h2 className="auth-form-title">Redefinir senha</h2>
          <p className="auth-form-subtitle">Crie uma nova senha para a sua conta</p>
          <Suspense fallback={<p className="auth-form-subtitle">A carregar...</p>}>
            <ResetPasswordForm />
          </Suspense>
          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/login" className="auth-link">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}