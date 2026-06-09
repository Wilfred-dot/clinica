'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, getMe } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

const VALID_ROLES = ['admin', 'medico', 'recepcionista', 'paciente'];

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams?.get('expired') === '1') {
      setError('A sua sessão expirou por inatividade. Faça login novamente.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const user = await getMe();
      if (!user || !VALID_ROLES.includes(user.role)) {
        throw new Error('Papel de utilizador desconhecido no sistema.');
      }
      loginSuccess(user);
      router.replace(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="exemplo@clinica.com"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Senha</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          disabled={loading}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-8px 0 24px' }}>
        <Link href="/forgot-password" className="auth-link">
          Esqueceu a senha?
        </Link>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      <button type="submit" disabled={loading} className="btn-submit">
        {loading ? 'A autenticar...' : 'Iniciar sessão'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">

        {/* TOPO — Logo + Nome */}
        <div className="login-brand">
          <Image
            src="/clinica-mmq.png"
            alt="Clínica MMQ"
            width={56}
            height={56}
            priority
            style={{ borderRadius: '14px' }}
          />
          <div>
            <h1 className="login-brand-name">Clínica MMQ</h1>
            <p className="login-brand-sub">Oftalmologia</p>
          </div>
        </div>

        {/* DIVISOR */}
        <div className="login-divider" />

        {/* FORMULÁRIO */}
        <div className="login-form-area">
          <h2 className="login-title">Iniciar sessão</h2>
          <p className="login-subtitle">Bem-vindo. Introduza as suas credenciais.</p>

          <Suspense fallback={<p className="login-subtitle">A carregar...</p>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* RODAPÉ */}
        <p className="login-footer">Clínica MMQ Oftalmologia © 2026</p>
      </div>
    </div>
  );
}