'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Consulta {
  id: number;
  data_hora: string;
  status: string;
  pacientes: {
    users: {
      name: string;
    };
  };
  medicos: {
    users: {
      name: string;
    };
  };
}

interface DashboardData {
  consultasHoje: {
    total: number;
    lista: Consulta[];
  };
  aguardando: number;
  atendidos: number;
}

// Mapeamento de status para badges com cores do design system
const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  agendada:  { bg: 'bg-warn-dim', text: 'text-warn', dot: 'bg-warn', label: 'Aguarda' },
  realizada: { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]', label: 'Realizada' },
  em_curso:  { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]', label: 'Em curso' },
  cancelada: { bg: 'bg-[var(--danger-dim)]', text: 'text-danger', dot: 'bg-danger', label: 'Cancelada' },
};

export default function RecepcionistaDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Saudação dinâmica
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = user?.name?.split(' ')[0] ?? '';

  const loadDashboardData = useCallback(() => {
    setLoading(true);
    setError(false);
    request<DashboardData>('/dashboard/recepcao')
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
          <button 
            onClick={loadDashboardData} 
            className="mt-4 px-4 py-2 bg-[var(--mmq-orange)] text-white rounded-md"
          >
            Tentar novamente
          </button>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <div className="p-8 text-center">
          <p className="text-ink-4">Nenhum dado disponível.</p>
        </div>
      </Shell>
    );
  }

  const { consultasHoje, aguardando, atendidos } = data;

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">
            {saudacao}{primeiroNome ? `, ${primeiroNome}` : ''}
          </h1>
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
            href="/recepcionista/consultations/agendar"
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
        {/* Card 1 – Consultas Hoje */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-warn"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-warn-dim mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--warn)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{consultasHoje.total}</h3>
          <p className="text-xs text-ink-3 font-semibold">Consultas Hoje</p>
          <div className="flex flex-col gap-0.5 mt-1.5">
            <div className="text-[11.5px] font-semibold text-warn">{atendidos} atendidos</div>
            <div className="flex items-center gap-1">
              <span className="text-ink-3 text-[10px]">{aguardando} aguardando</span>
            </div>
          </div>
        </div>

        {/* Card 2 – Aguardando */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--sky)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--sky-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--sky)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{aguardando}</h3>
          <p className="text-xs text-ink-3 font-semibold">Aguardando</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11.5px] font-semibold text-ink-3">
              {aguardando > 0 ? `${aguardando} na fila` : 'Nenhum na fila'}
            </span>
          </div>
        </div>

        {/* Card 3 – Atendidos */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--success)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-success-dim mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--success)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{atendidos}</h3>
          <p className="text-xs text-ink-3 font-semibold">Atendidos</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-success text-[11px] font-bold">
              {consultasHoje.total > 0 ? Math.round((atendidos / consultasHoje.total) * 100) : 0}%
            </span>
            <span className="text-ink-3 text-[10px]">concluídos</span>
          </div>
        </div>

        {/* Card 4 – Pacientes Registados */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--ink)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--sky-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--ink)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">0</h3>
          <p className="text-xs text-ink-3 font-semibold">Pacientes Registados</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-ink-3 text-[10px]">Total de pacientes</span>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo Central */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Coluna Esquerda */}
        <div className="flex flex-col gap-6">
          {/* Consultas de Hoje */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden h-fit transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)] flex-wrap">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <h3 className="text-[15px] font-bold text-[var(--ink)]">Consultas de Hoje</h3>
              </div>
              <Link
                href="/recepcionista/consultations"
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--white)] px-3 py-1.5 text-xs font-bold text-ink-2 transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                Ver todas
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--slate)]">
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Hora</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Paciente</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Médico</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasHoje.lista.map(c => {
                    const bad = statusBadgeClasses[c.status] || { 
                      bg: 'bg-slate2', 
                      text: 'text-ink-3', 
                      dot: 'bg-ink-4', 
                      label: c.status 
                    };
                    return (
                      <tr key={c.id} className="border-b border-[var(--border2)] last:border-b-0 hover:bg-[var(--slate)] transition">
                        <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-semibold">
                          {formatTime(c.data_hora)}
                        </td>
                        <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-bold">
                          {c.pacientes?.users?.name ?? 'N/D'}
                        </td>
                        <td className="p-[14px_18px] text-[13.5px] text-ink-3">
                          {c.medicos?.users?.name ?? 'N/D'}
                        </td>
                        <td className="p-[14px_18px]">
                          <span className={`inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-[20px] text-[11px] font-bold uppercase tracking-[0.3px] ${bad.bg} ${bad.text}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${bad.dot}`}></span>
                            {bad.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {consultasHoje.lista.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-ink-3 py-10 font-medium cursor-pointer hover:text-[var(--mmq-orange)] transition-colors" onClick={() => router.push('/recepcionista/consultations')}>
                        Nenhuma consulta agendada para hoje.<br />
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
                href="/recepcionista/consultations/agendar"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agendar Consulta
              </Link>
              
              <Link
                href="/recepcionista/patients/novo"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Registar Paciente
              </Link>
              
              <Link
                href="/recepcionista/patients"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Pesquisar Paciente
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
                href="/recepcionista/notifications/novo"
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--mmq-orange)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nova Notificação
              </Link>
            </div>
            <div className="p-4" onClick={() => router.push('/recepcionista/notifications')}>
              <div className="text-center py-8 cursor-pointer hover:text-[var(--mmq-orange)] transition-colors">
                <p className="text-[13px] text-ink-3 font-medium">Nenhuma notificação recente.</p>
                <span className="text-xs text-ink-4">Clique para ver todas as notificações</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}