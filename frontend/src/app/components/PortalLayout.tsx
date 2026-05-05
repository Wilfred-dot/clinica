'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      <div className="portal-topbar">
        <div className="portal-topbar-brand">
          <div className="ptm">
            <svg viewBox="0 0 24 24">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <strong>Clínica MMQ</strong>
            <span>Portal do Paciente</span>
          </div>
        </div>
        <div className="portal-nav">
          <Link href="/paciente" className={`portal-nav-btn ${pathname === '/paciente' ? 'active' : ''}`}>Início</Link>
          <Link href="/paciente/agendar" className={`portal-nav-btn ${pathname === '/paciente/agendar' ? 'active' : ''}`}>Agendar</Link>
          <Link href="/paciente/historico" className={`portal-nav-btn ${pathname === '/paciente/historico' ? 'active' : ''}`}>Histórico</Link>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="topbar-user" style={{ padding: '4px 8px', borderRadius: 'var(--r)' }}>
            <div className="topbar-avatar" style={{ background: 'rgba(0,125,116,.5)', border: '1px solid rgba(0,157,146,.5)' }}>{initials}</div>
            <div className="topbar-user-info"><div className="u-name" style={{ color: '#fff' }}>{user?.name}</div></div>
          </div>
          <button className="topbar-logout-btn" style={{ color: 'rgba(255,255,255,.5)' }} onClick={logout}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
