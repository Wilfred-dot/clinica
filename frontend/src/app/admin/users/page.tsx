'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ userId: number; action: 'activate' | 'deactivate' } | null>(null);

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
      // Atualização de estado pessimista: Só muda a UI se o servidor aceitou
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

  // Correção da Condição de Corrida e Processamento Inútil usando useMemo
  const filteredUsers = useMemo(() => {
    const cleanSearch = search.toLowerCase().trim();
    if (!cleanSearch) return users;
    return users.filter(u =>
      (u.name ?? '').toLowerCase().includes(cleanSearch) ||
      (u.email ?? '').toLowerCase().includes(cleanSearch)
    );
  }, [users, search]);

  return (
    <Shell>
      {/* Cabeçalho da Página */}
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Utilizadores</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">Contas de acesso ao sistema</p>
        </div>
        <Link href="/admin/users/novo" className="bg-[var(--mmq-orange)] text-white hover:bg-[var(--mmq-orange-lt)] px-4 py-2 rounded-md font-medium transition shadow-[0_1px_3px_rgba(255,127,0,0.1)] hover:shadow-[0_4px_14px_rgba(255,127,0,0.25)]" aria-label="Criar novo utilizador">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo utilizador
        </Link>
      </div>

      {/* Content Card / Table Panel */}
      <div className="card-panel overflow-hidden">
        <div className="card-header">
          <h3>Todos os utilizadores</h3>
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
                {filteredUsers.map(user => {
                  const roleKey = user.role?.toLowerCase() || 'paciente';
                  const roleBadge = roleBadgeClasses[roleKey] || roleBadgeClasses.paciente;
                  const statusBadge = user.ativo ? statusBadgeClasses.activo : statusBadgeClasses.inactivo;

                  return (
                    <tr key={user.id}>
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
                    <td colSpan={5} className="text-center text-muted py-6">Nenhum utilizador encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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