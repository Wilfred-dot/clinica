'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  return (
    <div>
      <div className="portal-topbar" role="banner">
        <div className="portal-topbar-brand">
          <div className="ptm">
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" fill="currentColor">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <strong>Clínica MMQ</strong>
            <span>Portal do Paciente</span>
          </div>
        </div>
        
        <nav className="portal-nav" aria-label="Navegação do Paciente">
          <Link href="/paciente" className={`portal-nav-btn ${pathname === '/paciente' ? 'active' : ''}`}>Início</Link>
          <Link href="/paciente/agendar" className={`portal-nav-btn ${pathname === '/paciente/agendar' ? 'active' : ''}`}>Agendar</Link>
          <Link href="/paciente/historico" className={`portal-nav-btn ${pathname === '/paciente/historico' ? 'active' : ''}`}>Histórico</Link>
        </nav>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="topbar-user" style={{ padding: '4px 8px', borderRadius: 'var(--r)' }}>
            <div className="topbar-user-info">
              <div className="u-name" style={{ color: 'var(--white)' }}>
                {loading ? 'A carregar...' : (user?.name ?? 'Paciente')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <main>
        {children}
      </main>
    </div>
  );
}