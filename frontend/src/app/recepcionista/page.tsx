'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

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
  realizada: { bg: 'bg-success-dim', text: 'text-[#1a7a4a]', dot: 'bg-[#1a7a4a]', label: 'Realizada' },
  em_curso:  { bg: 'bg-[#e6f0fb]', text: 'text-[#1258a8]', dot: 'bg-[#1258a8]', label: 'Em curso' },
  cancelada: { bg: 'bg-[#fdf0f0]', text: 'text-danger', dot: 'bg-danger', label: 'Cancelada' },
};

export default function RecepcionistaDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<DashboardData>('/dashboard/recepcao')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Shell>
        <p className="p-8 text-center text-ink-4">A carregar dashboard...</p>
      </Shell>
    );
  if (!data)
    return (
      <Shell>
        <p className="p-8 text-center text-ink-4">Erro ao carregar dados.</p>
      </Shell>
    );

  const { consultasHoje, aguardando, atendidos } = data;

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#102A6B] tracking-[-0.3px]">Bom dia, Fátima</h1>
          <p className="text-[13px] text-ink-3 mt-1">
            {new Date().toLocaleDateString('pt-MZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate hover:border-ink-4"
            onClick={() => router.push('/recepcionista/patients')}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Paciente
          </button>
          <button
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-mmq-orange px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-mmq-orange-hover"
            onClick={() => router.push('/recepcionista/consultations')}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agendar Consulta
          </button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-6">
        {/* Card warn - Consultas Hoje */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-warn"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-warn-dim mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#b87a00" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{consultasHoje.total}</h3>
          <p className="text-xs text-ink-3 font-medium">Consultas Hoje</p>
        </div>
        {/* Card sky - Aguardando */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#1258a8]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#e6f0fb] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#1258a8" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{aguardando}</h3>
          <p className="text-xs text-ink-3 font-medium">Aguardando</p>
        </div>
        {/* Card teal (green) - Atendidos */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-mmq-orange"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-warn-dim mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#FF7F00" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{atendidos}</h3>
          <p className="text-xs text-ink-3 font-medium">Atendidos</p>
        </div>
      </div>

      {/* Duas colunas: Consultas + Acções Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Consultas de Hoje */}
        <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6] flex-wrap">
            <h3 className="text-[14.5px] font-bold text-[#102A6B]">Consultas de Hoje</h3>
            <button
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#d6e0ea] bg-white px-3 py-1.5 text-xs font-semibold text-ink-2 transition hover:bg-slate"
              onClick={() => router.push('/recepcionista/consultations')}
            >
              Ver todas
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-slate text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Hora</th>
                <th className="bg-slate text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Paciente</th>
                <th className="bg-slate text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Médico</th>
                <th className="bg-slate text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {consultasHoje.lista.map(c => {
                const bad = statusBadgeClasses[c.status] || { bg: 'bg-slate2', text: 'text-ink-3', dot: 'bg-ink-4', label: c.status };
                return (
                  <tr key={c.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f6fafe] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[#102A6B] font-semibold">
                      {new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#102A6B]">
                      {c.pacientes?.users?.name ?? 'N/D'}
                    </td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#102A6B]">
                      {c.medicos?.users?.name ?? 'N/D'}
                    </td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${bad.bg} ${bad.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${bad.dot}`}></span>
                        {bad.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {consultasHoje.lista.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-ink-4 py-6">
                    Nenhuma consulta agendada para hoje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Acções Rápidas */}
        <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6]">
            <h3 className="text-[14.5px] font-bold text-[#102A6B]">Acções Rápidas</h3>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <button
              className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-mmq-orange px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-mmq-orange-hover"
              onClick={() => router.push('/recepcionista/consultations')}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agendar Consulta
            </button>
            <button
              className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate"
              onClick={() => router.push('/recepcionista/patients/novo')}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Registar Paciente
            </button>
            <button
              className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate"
              onClick={() => router.push('/recepcionista/patients')}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Pesquisar Paciente
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}