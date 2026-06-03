'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, getMe } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Endereço de email</label>
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
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-6px 0 18px' }}>
        <Link href="/forgot-password" className="auth-link">
          Esqueceu a senha?
        </Link>
      </div>
      
      {error && <div className="alert-error">{error}</div>}
      
      <button type="submit" disabled={loading} className="btn-submit">
        {loading ? 'A autenticar...' : 'Iniciar sessão'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-sidebar-grid" />
        <div className="auth-sidebar-glow" />
        <div style={{ position: 'relative' }}>
          <div className="auth-sidebar-icon-box">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--mmq-orange)" strokeWidth="1.8">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="auth-sidebar-title">
            Cuidados visuais<br /> 
            <em style={{ fontStyle: 'italic', color: 'var(--mmq-orange)' }}>de excelência</em><br /> 
            na Beira
          </h1>
          <p className="auth-sidebar-text">
            Plataforma integrada de gestão clínica para a Clínica MMQ Oftalmologia. Aceda ao sistema para gerir consultas, pacientes e registos clínicos.
          </p>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-form-wrapper">
          <h2 className="auth-form-title">Bem-vindo</h2>
          <p className="auth-form-subtitle">Introduza as suas credenciais para aceder</p>
          
          <Suspense fallback={<p className="auth-form-subtitle">A carregar...</p>}>
            <LoginForm />
          </Suspense>
          
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--ink4)' }}>
            Clínica MMQ Oftalmologia &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}