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

// Mapeamento das cores de cada nível de acesso (seguindo o style guide)
const roleBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  admin:          { bg: 'bg-[#e6f0fb]', text: 'text-[#1258a8]', dot: 'bg-[#1258a8]' },
  medico:         { bg: 'bg-[#e4f5f4]', text: 'text-[#007d74]', dot: 'bg-[#007d74]' },
  recepcionista:  { bg: 'bg-[#fef8ec]', text: 'text-[#b87a00]', dot: 'bg-[#b87a00]' },
  paciente:       { bg: 'bg-[#e8eef4]', text: 'text-[#2e4358]', dot: 'bg-[#a8bfcf]' },
};

const statusBadgeClasses = {
  activo:   { bg: 'bg-[#edf7f2]', text: 'text-[#1a7a4a]', dot: 'bg-[#1a7a4a]' },
  inactivo: { bg: 'bg-[#fdf0f0]', text: 'text-[#b83232]', dot: 'bg-[#b83232]' },
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
      .then(res => setUsers(res.data))
      .catch(() => console.error)
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
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Utilizadores</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">Contas de acesso ao sistema</p>
        </div>
        <Link
          href="/admin/users/novo"
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[#007d74] px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-[#009d92]"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo utilizador
        </Link>
      </div>

      {/* Card da tabela */}
      <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
        {/* Cabeçalho do card */}
        <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6] flex-wrap">
          <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Todos os utilizadores</h3>
          <div className="relative min-w-[200px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" width="14" height="14" stroke="#a8bfcf" fill="none" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar utilizador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-8 pr-3 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74]"
            />
          </div>
        </div>

        {/* Conteúdo: loading vs tabela */}
        {loading ? (
          <p className="p-6 text-center text-[#a8bfcf]">A carregar...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Nome</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Email</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Nível de acesso</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Estado</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const roleBadge = roleBadgeClasses[user.role.toLowerCase()] || roleBadgeClasses.paciente;
                const statusBadge = user.ativo ? statusBadgeClasses.activo : statusBadgeClasses.inactivo;

                return (
                  <tr key={user.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f6fafe] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27] font-semibold">{user.name}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{user.email}</td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${roleBadge.dot}`}></span>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                        {user.ativo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-[12px_18px]">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/users/${user.id}/editar`}
                          className="inline-flex items-center rounded-[6px] border border-[#d6e0ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9]"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setConfirm({ userId: user.id, action: user.ativo ? 'deactivate' : 'activate' })}
                          disabled={actionLoading === user.id}
                          className={`inline-flex items-center rounded-[6px] px-3 py-1.5 text-xs font-semibold transition border ${
                            user.ativo
                              ? 'bg-[#fef8ec] text-[#b87a00] border-[#f0d898] hover:bg-[#fdefd0]'
                              : 'bg-[#edf7f2] text-[#1a7a4a] border-[#aadcc0] hover:bg-[#d6f0e4]'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === user.id ? '...' : user.ativo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#a8bfcf] py-6">Nenhum utilizador encontrado.</td>
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