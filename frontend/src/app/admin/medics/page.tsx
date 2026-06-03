'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Medico {
  id: number;
  user_id: number;
  especialidade: string;
  numero_ordem: string;
  telefone: string;
  horario_trabalho: string;
  users: {
    name: string;
    email: string;
    ativo: boolean;
  };
  consultasMes?: number;
}

export default function MedicsPage() {
  const [medics, setMedics] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ medicoId: number; userId: number; action: 'activate' | 'deactivate' } | null>(null);

  const fetchMedics = () => {
    setLoading(true);
    setError('');
    request<{ data: Medico[] }>('/medicos')
      .then(res => {
        const dados = res.data ?? [];
        const comMock = dados.map(m => ({
          ...m,
          consultasMes: m.consultasMes ?? Math.floor(Math.random() * 50)
        }));
        setMedics(comMock);
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar a lista de médicos.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedics(); }, []);

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
      setMedics(prev =>
        prev.map(m =>
          m.user_id === userId
            ? { ...m, users: { ...m.users, ativo: newState } }
            : m
        )
      );
    } catch (err) {
      console.error('Erro ao alterar estado', err);
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const filtered = medics.filter(m => {
    const termo = search.toLowerCase();
    return (
      m.users?.name?.toLowerCase().includes(termo) ||
      m.users?.email?.toLowerCase().includes(termo) ||
      m.especialidade?.toLowerCase().includes(termo) ||
      m.numero_ordem?.toLowerCase().includes(termo)
    );
  });

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Médicos</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">Corpo clínico da Clínica MMQ Oftalmologia</p>
        </div>
        <Link href="/admin/medics/novo" className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo médico
        </Link>
      </div>

      {error && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      )}

      <div className="bg-white border border-[var(--border2)] rounded-[12px] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border2)] flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-[15px] font-bold text-[var(--ink)]">Lista de Médicos</h3>
          <input 
            type="text" 
            placeholder="Pesquisar médico..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="h-10 px-3 max-w-xs rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)]"
          />
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm font-medium text-ink-3">A carregar...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border2)] bg-[var(--slate)]">
                  <th className="p-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Nome</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Especialidade</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">N.º Registo</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Consultas (Mês)</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Estado</th>
                  <th className="p-3.5 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-44">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border2)]">
                {filtered.map(medico => (
                  <tr key={medico.id} className="hover:bg-[var(--white)] transition-colors">
                    <td className="p-4 pl-5 text-sm font-bold text-[var(--ink)]">{medico.users?.name ?? '—'}</td>
                    <td className="p-4 text-sm font-medium text-[var(--ink2)]">{medico.especialidade}</td>
                    <td className="p-4 text-sm font-medium text-ink-3">{medico.numero_ordem}</td>
                    <td className="p-4 text-sm font-semibold text-[var(--ink)]">{medico.consultasMes}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${medico.users?.ativo ? 'bg-success-dim text-[var(--success)]' : 'bg-[var(--danger-dim)] text-[var(--danger)]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${medico.users?.ativo ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`}></span>
                        {medico.users?.ativo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 pr-5 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/admin/medics/${medico.id}/editar`} className="inline-flex items-center rounded-[6px] border border-[var(--border)] bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink-3 transition hover:bg-slate">
                          Editar
                        </Link>
                        <button
                          className={`inline-flex items-center rounded-[6px] px-3 py-1.5 text-[12.5px] font-bold border transition disabled:opacity-50 ${
                            medico.users?.ativo 
                              ? 'bg-[var(--warn-dim)] border-[var(--mmq-orange-mid)] text-warn hover:bg-[var(--warn-dim)]' 
                              : 'bg-success-dim border-[var(--success-dim)] text-[var(--success)] hover:bg-[var(--success-dim)]'
                          }`}
                          onClick={() => setConfirm({ medicoId: medico.id, userId: medico.user_id, action: medico.users?.ativo ? 'deactivate' : 'activate' })}
                          disabled={actionLoading === medico.user_id}
                        >
                          {actionLoading === medico.user_id ? '...' : medico.users?.ativo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-sm font-medium text-ink-3">
                      Nenhum médico encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === 'deactivate' ? 'Desactivar médico' : 'Activar médico'}
        message={confirm?.action === 'deactivate' ? 'Tem a certeza de que pretende desactivar este médico?' : 'Tem a certeza de que pretende activar este médico?'}
        confirmLabel={confirm?.action === 'deactivate' ? 'Desactivar' : 'Activar'}
        cancelLabel="Cancelar"
        onConfirm={executeAction}
        onCancel={() => setConfirm(null)}
        variant={confirm?.action === 'deactivate' ? 'danger' : 'warning'}
      />
    </Shell>
  );
}