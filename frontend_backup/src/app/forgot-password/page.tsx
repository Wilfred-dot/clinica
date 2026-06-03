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
      await forgotPassword(email);
      setMessage('Se o endereço introduzido corresponder a uma conta ativa, receberá um link seguro de recuperação dentro de instantes.');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar o seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-sidebar-grid" />
        <div className="auth-sidebar-glow" />
        <div style={{ position: 'relative' }}>
          <div className="auth-sidebar-icon-box">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--mmq-orange)" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="auth-sidebar-title">
            Recuperar<br />acesso à<br /><em style={{ fontStyle: 'italic', color: 'var(--mmq-orange)' }}>sua conta</em>
          </h1>
          <p className="auth-sidebar-text">
            Enviaremos um link seguro para o seu endereço de email para que possa redefinir a sua senha de forma autónoma.
          </p>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-form-wrapper">
          <h2 className="auth-form-title">Recuperar senha</h2>
          <p className="auth-form-subtitle">Introduza o email associado à sua conta</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Endereço de email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="o-seu@email.com"
                required
                disabled={loading}
              />
            </div>
            
            {error && <div className="alert-error">{error}</div>}
            {message && <div className="alert-success">{message}</div>}
            
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'A processar...' : 'Enviar link de recuperação'}
            </button>
          </form>
          
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