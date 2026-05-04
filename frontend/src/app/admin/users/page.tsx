'use client';

import { useEffect, useState } from 'react';
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ userId: number; action: 'activate' | 'deactivate' } | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    request<{ data: User[] }>('/users')
      .then(res => setUsers(res.data))
      .catch(() => {})
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
      console.error('Erro ao alterar estado', err);
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Utilizadores</h1>
          <p className="sub">Contas de acesso ao sistema</p>
        </div>
        <Link href="/admin/users/novo" className="btn btn-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo utilizador
        </Link>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Todos os utilizadores</h3>
          <div className="search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Pesquisar utilizador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
        ) : (
          <table>
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
              {filtered.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' ? 'bb' :
                      user.role === 'medico' ? 'bt' :
                      user.role === 'recepcionista' ? 'bw' : 'bn'
                    }`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${user.ativo ? 'bg' : 'br'}`}>
                      {user.ativo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap8">
                      <Link href={`/admin/users/${user.id}/editar`} className="btn btn-outline btn-sm">
                        Editar
                      </Link>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: user.ativo ? 'var(--warn-dim)' : 'var(--success-dim)',
                          color: user.ativo ? 'var(--warn)' : 'var(--success)',
                          border: user.ativo ? '1px solid #f3d98a' : '1px solid #a8ddc0',
                        }}
                        onClick={() => setConfirm({ userId: user.id, action: user.ativo ? 'deactivate' : 'activate' })}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? '...' : user.ativo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
