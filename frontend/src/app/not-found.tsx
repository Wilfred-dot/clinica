'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--slate)',
      gap: '16px',
      textAlign: 'center',
      padding: '32px',
    }}>
      <div style={{
        fontSize: '72px',
        fontWeight: 700,
        color: 'var(--mmq-orange)',
        lineHeight: 1,
        letterSpacing: '-4px',
      }}>404</div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
        Página não encontrada
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--ink3)', maxWidth: '360px' }}>
        A página que procura não existe ou foi removida.
      </p>
      <Link href="/login" style={{
        marginTop: '8px',
        background: 'var(--mmq-orange)',
        color: '#fff',
        padding: '10px 24px',
        borderRadius: 'var(--r)',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
      }}>
        Voltar ao início
      </Link>
    </div>
  );
}