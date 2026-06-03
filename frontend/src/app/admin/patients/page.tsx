'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Paciente {
  id: number;
  user_id: number;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  endereco: string;
  historico_medico?: string;
  users: {
    name: string;
    email: string;
    ativo: boolean;
  };
  ultimo_atendimento?: string;
}

const statusBadgeClasses = {
  activo:   { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  inactivo: { bg: 'bg-[var(--danger-dim)]', text: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]' },
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ patientId: number; userId: number; action: 'activate' | 'deactivate' } | null>(null);

  const fetchPatients = () => {
    setLoading(true);
    request<{ data: Paciente[] }>('/pacientes')
      .then(res => setPatients(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

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
      setPatients(prev =>
        prev.map(p =>
          p.user_id === userId
            ? { ...p, users: { ...p.users, ativo: newState } }
            : p
        )
      );
    } catch (err) {
      console.error('Erro ao alterar estado', err);
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const filtered = patients.filter(p =>
    p.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.telefone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Pacientes</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">Base de dados de pacientes registados na clínica</p>
        </div>
        <Link
          href="/admin/patients/novo"
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo paciente
        </Link>
      </div>

      {/* Card da tabela */}
      <div className="bg-white rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5 border-b border-[var(--border2)] flex-wrap">
          <h3 className="text-[15px] font-bold text-[var(--ink)]">Lista de Pacientes</h3>
          <div className="relative min-w-[260px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" width="14" height="14" stroke="var(--ink3)" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por nome ou contacto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)]"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm font-medium text-ink-3">A carregar...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border2)] bg-[var(--slate)]">
                  <th className="p-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Nome</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Contacto</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Último Atendimento</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Estado</th>
                  <th className="p-3.5 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border2)]">
                {filtered.map(patient => {
                  const ativo = patient.users?.ativo ?? false;
                  const statusBadge = ativo ? statusBadgeClasses.activo : statusBadgeClasses.inactivo;

                  return (
                    <tr key={patient.id} className="hover:bg-[var(--white)] transition-colors">
                      <td className="p-4 pl-5 text-sm font-bold text-[var(--ink)]">
                        {patient.users?.name ?? 'N/D'}
                      </td>
                      <td className="p-4 text-sm font-medium text-[var(--ink2)]">
                        {patient.telefone}
                      </td>
                      <td className="p-4 text-sm font-medium text-ink-3">
                        {patient.ultimo_atendimento
                          ? new Date(patient.ultimo_atendimento).toLocaleDateString('pt-MZ')
                          : '—'}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                          {ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4 pr-5 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/admin/patients/${patient.id}`}
                            className="inline-flex items-center rounded-[6px] px-2.5 py-1.5 text-xs font-bold border border-[var(--border)] bg-white text-[var(--ink)] transition hover:bg-slate"
                          >
                            Histórico
                          </Link>
                          <Link
                            href={`/admin/patients/${patient.id}/editar`}
                            className="inline-flex items-center rounded-[6px] border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-bold text-ink-3 transition hover:bg-slate"
                          >
                            Editar
                          </Link>
                          {ativo ? (
                            <button
                              onClick={() => setConfirm({ patientId: patient.id, userId: patient.user_id, action: 'deactivate' })}
                              disabled={actionLoading === patient.user_id}
                              className="inline-flex items-center rounded-[6px] px-2.5 py-1.5 text-xs font-bold bg-[var(--danger-dim)] text-[var(--danger)] border border-[var(--danger-dim)] transition hover:bg-[var(--danger-dim)] disabled:opacity-50"
                            >
                              {actionLoading === patient.user_id ? '...' : 'Inactivar'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirm({ patientId: patient.id, userId: patient.user_id, action: 'activate' })}
                              disabled={actionLoading === patient.user_id}
                              className="inline-flex items-center rounded-[6px] px-2.5 py-1.5 text-xs font-bold bg-success-dim text-[var(--success)] border border-[var(--success-dim)] transition hover:bg-[var(--success-dim)] disabled:opacity-50"
                            >
                              {actionLoading === patient.user_id ? '...' : 'Activar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-ink-3 font-medium p-12 text-sm">
                      Nenhum paciente encontrado.
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
        title={confirm?.action === 'deactivate' ? 'Inactivar paciente' : 'Activar paciente'}
        message={confirm?.action === 'deactivate' ? 'Tem a certeza de que pretende inactivar este paciente?' : 'Tem a certeza de que pretende activar este paciente?'}
        confirmLabel={confirm?.action === 'deactivate' ? 'Inactivar' : 'Activar'}
        cancelLabel="Cancelar"
        onConfirm={executeAction}
        onCancel={() => setConfirm(null)}
        variant={confirm?.action === 'deactivate' ? 'warning' : 'danger'}
      />
    </Shell>
  );
}