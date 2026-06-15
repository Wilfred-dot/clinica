'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 3h7v7H3V3zm10 0h7v7h-7V3zM3 14h7v7H3v-7zm10 0h7v7h-7v-7z' },
  { label: 'Utilizadores', href: '/admin/users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { label: 'Médicos', href: '/admin/medics', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10' },
  { label: 'Pacientes', href: '/admin/patients', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z' },
  { label: 'Consultas', href: '/admin/consultations', icon: 'M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18' },
  { label: 'Notificações', href: '/admin/notifications', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { label: 'Relatórios', href: '/admin/reports', icon: 'M18 20V10M12 20V4M6 20v-6' },
];

const medicoNav = [
  { label: 'Dashboard', href: '/medico', icon: 'M3 3h7v7H3V3zm10 0h7v7h-7V3zM3 14h7v7H3v-7zm10 0h7v7h-7v-7z' },
  { label: 'Atendimento', href: '/medico/attend', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z' },
  { label: 'Fichas Clínicas', href: '/medico/records', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6' },
];

const recepcionistaNav = [
  { label: 'Dashboard', href: '/recepcionista', icon: 'M3 3h7v7H3V3zm10 0h7v7h-7V3zM3 14h7v7H3v-7zm10 0h7v7h-7v-7z' },
  { label: 'Pacientes', href: '/recepcionista/patients', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z' },
  { label: 'Consultas', href: '/recepcionista/consultations', icon: 'M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18' },
];

const navMap: Record<string, { label: string; href: string; icon: string }[]> = {
  admin: adminNav,
  medico: medicoNav,
  recepcionista: recepcionistaNav,
};

function capitalize(s: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const role = user?.role ?? '';
  const navItems = navMap[role] || [];

  return (
    <div>
      <div className="topbar" role="banner">
        <div
          className="topbar-brand"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          onClick={() => { if (role) router.push(`/${role}`); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' && role) router.push(`/${role}`); }}
          aria-label="Ir para a página inicial do painel"
        >
          <Image
            src="/clinica-mmq.png"
            alt="Clínica MMQ Logo"
            width={32}
            height={32}
            priority
          />
          <div className="topbar-brand-text">
            <strong>Clínica MMQ</strong>
            <span>Oftalmologia</span>
          </div>
        </div>

        <div className="topbar-spacer" />
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="topbar-logout-btn"
          title="Alternar tema"
          aria-label="Alternar entre modo claro e escuro"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div className="topbar-user">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--mmq-orange)] text-white flex items-center justify-center text-sm font-medium">
              {(() => {
                if (!user?.name) return 'UU';
                const parts = user.name.trim().split(/\s+/);
                if (parts.length >= 2) {
                  return (parts[0][0] + parts[1][0]).toUpperCase();
                }
                return user.name.substring(0, 2).toUpperCase();
              })()}
            </div>
            <div className="topbar-user-info">
              <div className="u-name">
                {loading ? 'A carregar...' : (user?.name ?? 'Utilizador')}
              </div>
              <div className="u-role">
                {loading ? '...' : (role ? capitalize(role) : 'Nenhum papel')}
              </div>
            </div>
          </div>
        </div>

        <button
          className="topbar-logout-btn"
          onClick={logout}
          title="Sair do Sistema"
          aria-label="Sair do Sistema"
          style={{ cursor: 'pointer' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>

      <div className="shell">
        <aside className="sidebar" role="complementary" aria-label="Menu Lateral">
          {/* Sidebar com secções ordenadas: Principal primeiro, depois Gestão, Operação, Análise */}
          {[
            // Principal (Dashboard) vem primeiro
            { label: 'Principal', items: navItems.filter(item => !['Utilizadores', 'Médicos', 'Pacientes', 'Consultas', 'Notificações', 'Relatórios', 'Atendimento', 'Fichas Clínicas'].includes(item.label)) },
            // Gestão
            { label: 'Gestão', items: navItems.filter(item => ['Utilizadores', 'Médicos', 'Pacientes'].includes(item.label)) },
            // Operação
            { label: 'Operação', items: navItems.filter(item => ['Consultas', 'Notificações', 'Atendimento'].includes(item.label)) },
            // Análise
            { label: 'Análise', items: navItems.filter(item => ['Relatórios', 'Fichas Clínicas'].includes(item.label)) },
          ].filter(section => section.items.length > 0).map((section) => (
            <div className="sidebar-section" key={section.label}>
              <div className="sidebar-label">{section.label}</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} aria-label={`Navegação ${section.label}`}>
                {section.items.map((item) => {
                  // Validação de rota ativa
                  const isHomeRole = item.href === `/${role}`;
                  const isActive = pathname === item.href || (!isHomeRole && pathname.startsWith(item.href + '/'));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <div className="ni">
                        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={item.icon} />
                        </svg>
                      </div>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '16px 18px 0', borderTop: '1px solid var(--border2)' }}>
            <button
              className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', cursor: 'pointer' }}
              onClick={logout}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sair
            </button>
          </div>
        </aside>

        <main className="main" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}