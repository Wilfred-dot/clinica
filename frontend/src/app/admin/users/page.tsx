'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  ativo: boolean;
}

const roleBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  admin:         { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]' },
  medico:        { bg: 'bg-warn-dim', text: 'text-mmq-orange', dot: 'bg-mmq-orange' },
  recepcionista: { bg: 'bg-warn-dim', text: 'text-warn', dot: 'bg-warn' },
  paciente:      { bg: 'bg-slate2', text: 'text-ink-2', dot: 'bg-ink-4' },
};

const statusBadgeClasses = {
  activo:   { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  inactivo: { bg: 'bg-[var(--danger-dim)]', text: 'text-danger', dot: 'bg-danger' },
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ userId: number; action: 'activate' | 'deactivate' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchUsers = () => {
    setLoading(true);
    request<{ data: User[] }>('/users')
      .then(res => setUsers(res?.data ?? []))
      .catch((err) => console.error('Erro ao carregar utilizadores:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const executeAction = async () => {
    if (!confirm) return;
    const { userId, action } = confirm;
    setActionLoading(userId);
    try {
      const newState = action === 'activate';
      await request(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: newState }),
      });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, ativo: newState } : u))
      );
    } catch (err) {
      alert('Não foi possível alterar o estado do utilizador. Verifique a sua ligação.');
      console.error('Erro ao alterar estado do utilizador:', err);
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const cleanSearch = debouncedSearch.toLowerCase().trim();
    if (!cleanSearch) return users;
    return users.filter(u => 
      (u.name ?? '').toLowerCase().includes(cleanSearch) ||
      (u.email ?? '').toLowerCase().includes(cleanSearch)
    );
  }, [users, debouncedSearch]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Utilizadores</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">Contas de acesso ao sistema</p>
        </div>
        <Link href="/admin/users/novo" className="inline-flex items-center gap-1.5 bg-[var(--mmq-orange)] text-white hover:bg-[var(--mmq-orange-lt)] px-4 py-2 rounded-md font-medium transition shadow-[0_1px_3px_rgba(255,127,0,0.1)] hover:shadow-[0_4px_14px_rgba(255,127,0,0.25)]" aria-label="Criar novo utilizador">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo utilizador
        </Link>
      </div>

      <div className="card-panel overflow-hidden">
        <div className="card-header">
          <h3>Todos os utilizadores</h3>
          <p className="text-[13px] text-ink-3 mt-1">Mostrando {filteredUsers.length} de {users.length} utilizador(es)</p>
          <div className="search-container" role="search">
            <svg className="search-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar utilizador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control search-input"
              aria-label="Campo de pesquisa de utilizadores"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-center text-muted animate-pulse">A carregar utilizadores...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Nível de acesso</th>
                  <th>Estado</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => {
                  const roleKey = user.role?.toLowerCase() || 'paciente';
                  const roleBadge = roleBadgeClasses[roleKey] || roleBadgeClasses.paciente;
                  const statusBadge = user.ativo ? statusBadgeClasses.activo : statusBadgeClasses.inactivo;

                  return (
                    <tr 
                      key={user.id} 
                      className="cursor-pointer hover:bg-[var(--white)]"
                      onClick={() => router.push(`/admin/users/${user.id}/editar`)}
                    >
                      <td className="font-semibold">{user.name ?? 'Sem Nome'}</td>
                      <td>{user.email ?? 'Sem Email'}</td>
                      <td>
                        <span className={`badge ${roleBadge.bg} ${roleBadge.text}`}>
                          <span className={`badge-dot ${roleBadge.dot}`}></span>
                          {user.role ?? 'Paciente'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge.bg} ${statusBadge.text}`}>
                          <span className={`badge-dot ${statusBadge.dot}`}></span>
                          {user.ativo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/admin/users/${user.id}/editar`} className="btn btn-sm btn-outline">
                            Editar
                          </Link>
                          <button
                            onClick={() => setConfirm({ userId: user.id, action: user.ativo ? 'deactivate' : 'activate' })}
                            disabled={actionLoading === user.id}
                            className={`btn btn-sm ${user.ativo ? 'btn-deactivate' : 'btn-activate'}`}
                          >
                            {actionLoading === user.id ? '...' : user.ativo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-12">
                      <div className="flex flex-col items-center gap-4">
                        <svg className="h-10 w-10 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 9v3a3 3 0 005.196 3H15a3 3 0 005.196-3V9"/>
                          <path d="M9 9h.01"/>
                          <path d="M15 15h.01"/>
                          <path d="M9 22h6"/>
                          <path d="M12 2v4.01"/>
                        </svg>
                        <p className="text-center">Nenhum utilizador encontrado.</p>
                        <Link href="/admin/users/novo" className="btn btn-sm btn-primary">Criar primeiro utilizador</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Paginação */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--slate)] rounded-b">
        <p className="text-[13px] text-ink-3">
          Página {currentPage} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-[12.5px] font-medium 
                      ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--mmq-orange-lt)]'} 
                      bg-[var(--mmq-orange)] text-white transition`}
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-[12.5px] font-medium 
                      ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--mmq-orange-lt)]'} 
                      bg-[var(--mmq-orange)] text-white transition`}
          >
            Próxima
          </button>
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === 'deactivate' ? 'Desactivar utilizador' : 'Activar utilizador'}
        message={confirm?.action === 'deactivate' ? 'Tem a certeza de que pretende desactivar este utilizador?' : 'Tem a certeza de que pretende activar este utilizador?'}
        confirmLabel={confirm?.action === 'deactivate' ? 'Desactivar' : 'Activar'}
        cancelLabel="Cancelar"
        onConfirm={executeAction}
        onCancel={() => setConfirm(null)}
        variant={confirm?.action === 'deactivate' ? 'danger' : 'warning'}
      />
    </Shell>
  );
}