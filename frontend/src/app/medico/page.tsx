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

interface MedicoDashboardData {
  consultasHoje: {
    total: number;
    lista: ConsultaItem[];
  };
  ultimasFichas?: ConsultaItem[];
  aguardando?: number;
  concluidas?: number;
  consultasMes?: number;
  medico?: {
    users: {
      name: string;
    };
  };
}

const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  agendada:  { bg: 'bg-warn-dim', text: 'text-warn', dot: 'bg-warn' },
  realizada: { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  em_curso:  { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]' },
  cancelada: { bg: 'bg-[var(--danger-dim)]', text: 'text-danger', dot: 'bg-danger' },
};

export default function MedicoDashboard() {
  const router = useRouter();
  const [data, setData] = useState<MedicoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboardData = useCallback(() => {
    setLoading(true);
    setError(false);
    request<MedicoDashboardData>('/dashboard/medico')
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

  // Saudação dinâmica
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = data?.medico?.users?.name?.split(' ')[0] ?? '';

  const { consultasHoje, ultimasFichas = [] } = data || { consultasHoje: { total: 0, lista: [] }, ultimasFichas: [] };
  const aguardando = data?.aguardando ?? 0;
  const concluidas = data?.concluidas ?? 0;
  const consultasMes = data?.consultasMes ?? 0;

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
            href="/medico/attend"
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-5 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Iniciar Atendimento
          </Link>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 mb-6">
        {/* Card 1 – Consultas Hoje */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--sky)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--sky-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--sky)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{consultasHoje.total}</h3>
          <p className="text-xs text-ink-3 font-semibold">Consultas Hoje</p>
          <div className="flex flex-col gap-0.5 mt-1.5">
            <div className="text-[11.5px] font-semibold text-[var(--sky)]">{aguardando} aguardando</div>
            <div className="text-[11.5px] font-semibold text-success">{concluidas} concluídas</div>
          </div>
        </div>

        {/* Card 2 – Aguardando */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-warn"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--warn-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--warn)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{aguardando}</h3>
          <p className="text-xs text-ink-3 font-semibold">Aguardando</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11.5px] font-semibold text-warn">
              {aguardando > 0 ? `${aguardando} na fila` : 'Nenhum na fila'}
            </span>
          </div>
        </div>

        {/* Card 3 – Concluídas */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--success)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-success-dim mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--success)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{concluidas}</h3>
          <p className="text-xs text-ink-3 font-semibold">Concluídas Hoje</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-success text-[11px] font-bold">
              {consultasHoje.total > 0 ? Math.round((concluidas / consultasHoje.total) * 100) : 0}%
            </span>
            <span className="text-ink-3 text-[10px]">concluídas</span>
          </div>
        </div>

        {/* Card 4 – Consultas este Mês */}
        <div className="bg-[var(--white)] rounded-[12px] p-[20px_22px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden transition hover:border-[var(--mmq-orange)]">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[var(--mmq-orange)]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[var(--mmq-orange-dim)] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[var(--ink)] tracking-[-1px] leading-none mb-1">{consultasMes}</h3>
          <p className="text-xs text-ink-3 font-semibold">Consultas este Mês</p>
          <div className="flex flex-col gap-0.5 mt-1.5">
            <div className="text-[11.5px] font-semibold text-[var(--mmq-orange)]">Total do mês</div>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo Central */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Coluna Esquerda */}
        <div className="flex flex-col gap-6">
          {/* Agenda de Hoje */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden h-fit transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)] flex-wrap">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3 className="text-[15px] font-bold text-[var(--ink)]">Agenda de Hoje</h3>
              </div>
              <Link
                href="/medico/attend"
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--white)] px-3 py-1.5 text-xs font-bold text-ink-2 transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                Iniciar
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--slate)]">
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Hora</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Paciente</th>
                    <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasHoje.lista.map(c => {
                    const statusKey = c.status?.toLowerCase() || 'agendada';
                    const bad = statusBadgeClasses[statusKey] || { bg: 'bg-slate2', text: 'text-ink-3', dot: 'bg-ink-4' };
                    
                    return (
                      <tr key={c.id} className="border-b border-[var(--border2)] last:border-b-0 hover:bg-[var(--slate)] transition cursor-pointer" onClick={() => router.push(`/medico/attend/${c.id}`)}>
                        <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-semibold">
                          {formatTime(c.data_hora)}
                        </td>
                        <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-bold">
                          {c.pacientes?.users?.name ?? 'N/D'}
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
                  {consultasHoje.lista.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-ink-3 py-10 font-medium cursor-pointer hover:text-[var(--mmq-orange)] transition-colors" onClick={() => router.push('/medico/attend')}>
                        Nenhuma consulta agendada para hoje.<br />
                        <span className="text-xs text-ink-4">Clique para iniciar atendimento</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Últimas Fichas */}
        <div className="flex flex-col gap-6">
          {ultimasFichas.length > 0 && (
            <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)]">
              <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)] flex-wrap">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--mmq-orange)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <h3 className="text-[15px] font-bold text-[var(--ink)]">Últimas Fichas</h3>
                </div>
                <Link
                  href="/medico/records"
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--white)] px-3 py-1.5 text-xs font-bold text-ink-2 transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
                >
                  Ver todas
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--slate)]">
                      <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Paciente</th>
                      <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Data</th>
                      <th className="text-[11px] font-bold uppercase tracking-[0.7px] p-[12px_18px] text-left text-ink-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasFichas.map(c => {
                      const statusKey = c.status?.toLowerCase() || 'agendada';
                      const bad = statusBadgeClasses[statusKey] || { bg: 'bg-slate2', text: 'text-ink-3', dot: 'bg-ink-4' };
                      
                      return (
                        <tr key={c.id} className="border-b border-[var(--border2)] last:border-b-0 hover:bg-[var(--slate)] transition cursor-pointer" onClick={() => router.push(`/medico/records/${c.id}`)}>
                          <td className="p-[14px_18px] text-[13.5px] text-[var(--ink)] font-bold">
                            {c.pacientes?.users?.name ?? 'N/D'}
                          </td>
                          <td className="p-[14px_18px] text-[13.5px] text-ink-3">
                            {new Date(c.data_hora).toLocaleDateString('pt-MZ')}
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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Acções Rápidas */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[var(--border2)]">
              <h3 className="text-[15px] font-bold text-[var(--ink)]">Acções Rápidas</h3>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              <Link
                href="/medico/attend"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Iniciar Atendimento
              </Link>
              
              <Link
                href="/medico/records"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Ver Fichas Clínicas
              </Link>
              
              <Link
                href="/medico/records/novo"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nova Ficha Clínica
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}