'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, getMe } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const user = await getMe();
      loginSuccess(user);
      router.push('/' + user.role);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 480px' }}>
      <div style={{
        background: 'linear-gradient(160deg, #0d1b2a 0%, #0a2840 50%, #073d36 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 600px 400px at 30% 60%, rgba(10,126,116,.25) 0%, transparent 70%), radial-gradient(ellipse 400px 300px at 80% 20%, rgba(20,97,168,.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(10,126,116,.35)',
            border: '1px solid rgba(10,126,116,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 32
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0d9b8f" strokeWidth="1.8">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: 38, fontWeight: 300, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-.5px', marginBottom: 16
          }}>
            Cuidados visuais<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(13,155,143,.9)' }}>de excelência</em><br />
            na Beira
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', maxWidth: 360, lineHeight: 1.7 }}>
            Plataforma integrada de gestão clínica para a Clínica MMQ Oftalmologia.
            Aceda ao sistema para gerir consultas, pacientes e registos clínicos.
          </p>
        </div>
      </div>
      <div style={{
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 52px', fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0d1b2a', marginBottom: 6 }}>Bem-vindo</h2>
          <p style={{ fontSize: 13, color: '#8498aa', marginBottom: 32 }}>Introduza as suas credenciais para aceder</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3d5166', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 7 }}>
                Endereço de email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@clinica.com"
                required
                style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid #dde5ed',
                  borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 14,
                  color: '#0d1b2a', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3d5166', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 7 }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid #dde5ed',
                  borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 14,
                  color: '#0d1b2a', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-6px 0 18px' }}>
              <Link href="/forgot-password" style={{ fontSize: 12.5, color: '#0a7e74', textDecoration: 'none', fontWeight: 500 }}>
                Esqueceu a senha?
              </Link>
            </div>
            {error && (
              <div style={{ background: '#fdf2f1', color: '#c0392b', padding: 8, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '9px 18px', borderRadius: 8,
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: '#0d1b2a', color: '#fff',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Autenticando...' : 'Iniciar sessão'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#b8c8d4' }}>
            Clínica MMQ Oftalmologia &copy; 2025
          </p>
        </div>
      </div>
    </div>
  );
}