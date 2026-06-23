'use client';

import { useEffect, useState, useCallback } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConsultaItem {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string }; id: number };
}

interface DashboardData {
  totalConsultas: number;
  totalPacientes: number;
  totalMedicos: number;
  totalRecepcionistas: number;
  consultasHoje: ConsultaItem[];
  consultasSemana: ConsultaItem[];
  ultimasConsultas: ConsultaItem[];
  actividadeRecente: Array<{
    id: number;
    mensagem: string;
    paciente: string;
    data: string;
  }>;
}

const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  agendada:  { bg: 'bg-warn-dim', text: 'text-warn', dot: 'bg-warn' },
  realizada: { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  em_curso:  { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]' },
  cancelada: { bg: 'bg-[var(--danger-dim)]', text: 'text-danger', dot: 'bg-danger' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboardData = useCallback(() => {
    setLoading(true);
    setError(false);
    request<DashboardData>('/dashboard/admin')
      .then(setData)
      .catch((err) => {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatTime = (isoString: string) => {
    if (!isoString) return 'N/D';
    try {
      return new Date(isoString).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/D';
    }
  };

  const totalConsultas = data?.totalConsultas ?? 0;
  const totalPacientes = data?.totalPacientes ?? 0;
  const totalMedicos = data?.totalMedicos ?? 0;
  const totalRecepcionistas = data?.totalRecepcionistas ?? 0;
  const consultasSemana = data?.consultasSemana ?? [];
  const actividadeRecente = data?.actividadeRecente ?? [];
  const realizadasSemana = consultasSemana.filter(c => c.status === 'realizada').length;

  const consultasMesAnterior = data?.ultimasConsultas ?? [];

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-ink-4">A carregar dashboard...</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="p-8 text-center">
          <p className="text-danger">Erro ao carregar dados.</p>
          <button onClick={loadDashboardData} className="mt-4 px-4 py-2 bg-[var(--mmq-orange)] text-white rounded-md">
            Tentar novamente
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Painel de Gestão</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium uppercase tracking-[0.2px]">
            {new Date().toLocaleDateString('pt-MZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/consultations/agendar"
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-5 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Consulta
          </Link>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 mb-6">
        {/* Card 1 – Consultas da Semana */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-warn"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--warn-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--warn)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{consultasSemana.length}</h3>
          <p className="text-xs text-ink-3 font-semibold">Consultas da Semana</p>
          <div className="flex flex-col gap-0.5 mt-1.5">
            <div className="text-[11.5px] font-semibold text-warn">{realizadasSemana} concluídas esta semana</div>
            <div className="flex items-center gap-1">
              <span className="text-danger text-[11px] font-bold">▼ {consultasMesAnterior.length}</span>
              <span className="text-ink-3 text-[10px]">vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Card 2 – Total de Consultas este Mês */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--mmq-orange)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--mmq-orange-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{totalConsultas}</h3>
          <p className="text-xs text-ink-3 font-semibold">Total de Consultas este Mês</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-success text-[11px] font-bold">▲ {consultasMesAnterior.length}</span>
            <span className="text-ink-3 text-[10px]">vs mês anterior</span>
          </div>
        </div>

        {/* Card 3 – Pacientes Registados */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--ink)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--sky-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--ink)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{totalPacientes}</h3>
          <p className="text-xs text-ink-3 font-semibold">Pacientes Registados</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-success text-[11px] font-bold">▲ {totalPacientes > 0 ? totalPacientes - 1 : 0}</span>
            <span className="text-ink-3 text-[10px]">vs mês anterior</span>
          </div>
        </div>

        {/* Card 4 – Equipa Clínica */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--success)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-success-dim mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--success)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
              <path d="M12 8V16" /><path d="M8 12H16" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{totalMedicos + totalRecepcionistas}</h3>
          <p className="text-xs text-ink-3 font-semibold">Equipa Clínica</p>
          <div className="flex flex-col gap-0.5 mt-1.5">
            <div className="text-[11.5px] font-semibold text-success">{totalMedicos} médicos</div>
            <div className="text-[11.5px] font-semibold text-ink-3">{totalRecepcionistas} recepcionistas</div>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo Central */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Coluna Esquerda */}
        <div className="flex flex-col gap-6">
          {/* Consultas da Semana */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden h-fit transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)] flex-wrap">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3 className="text-[15px] font-bold text-[var(--ink)]">Consultas da Semana</h3>
              </div>
              <Link
                href="/admin/consultations/agendar"
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--mmq-orange)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar Consulta
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--mmq-orange)] text-white">
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left">Paciente</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left">Médico</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left">Hora</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasSemana.map(c => {
                    const statusKey = c.status?.toLowerCase() || 'agendada';
                    const bad = statusBadgeClasses[statusKey] || { bg: 'bg-slate2', text: 'text-ink-3', dot: 'bg-ink-4' };
                    
                    return (
                      <tr key={c.id} className="border-b border-[var(--border2)] last:border-b-0 hover:bg-[var(--slate)] transition">
                        <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-bold">{c.pacientes?.users?.name ?? 'N/D'}</td>
                        <td className="p-[14px_18px] text-[13.5px] text-ink-3 font-medium">{c.medicos?.users?.name ?? 'N/D'}</td>
                        <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-semibold">
                          {formatTime(c.data_hora)}
                        </td>
                        <td className="p-[14px_18px]">
                          <span className={`inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-[20px] text-[11px] font-bold uppercase tracking-[0.3px] ${bad.bg} ${bad.text}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${bad.dot}`}></span>
                            {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ') : 'N/D'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {consultasSemana.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-ink-3 py-10 font-medium cursor-pointer hover:text-[var(--mmq-orange)] transition-colors" onClick={() => router.push('/admin/consultations')}>
                        Nenhuma consulta agendada para esta semana.<br />
                        <span className="text-xs text-ink-4">Clique para ver todas as consultas</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acções Rápidas */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)]">
              <h3 className="text-[15px] font-bold text-[var(--ink)]">Acções Rápidas</h3>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              <Link
                href="/admin/patients/novo"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar Paciente
              </Link>
              
              <Link
                href="/admin/users/novo"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Adicionar Recepcionista
              </Link>
              
              <Link
                href="/admin/medics/novo"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 8v8m-4-4h8M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                </svg>
                Adicionar Médico
              </Link>
              
              <Link
                href="/admin/reports"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Visualizar Relatório
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Notificações */}
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)] flex-wrap">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <h3 className="text-[15px] font-bold text-[var(--ink)]">Notificações</h3>
              </div>
              <Link
                href="/admin/notifications/novo"
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--mmq-orange)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nova Notificação
              </Link>
            </div>
            <div className="p-4" onClick={() => router.push('/admin/notifications')}>
              {actividadeRecente.length > 0 ? actividadeRecente.map(a => (
                <div 
                  key={a.id} 
                  className="flex gap-3 items-start p-3 rounded-[8px] border border-[var(--border2)] bg-[var(--white)] shadow-[0_1px_2px_rgba(0,0,0,0.01)] mb-2 last:mb-0 hover:border-[var(--mmq-orange)] transition cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[var(--mmq-orange)]"></div>
                  <div>
                    <strong className="font-semibold text-[13.5px] text-[var(--ink)]">{a.mensagem}</strong>
                    <span className="block text-xs text-ink-3 mt-0.5">
                      {a.data ? new Date(a.data).toLocaleString('pt-MZ') : 'N/D'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 cursor-pointer hover:text-[var(--mmq-orange)] transition-colors">
                  <p className="text-[13px] text-ink-3 font-medium">Nenhuma notificação recente.</p>
                  <span className="text-xs text-ink-4">Clique para ver todas as notificações</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}