'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

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
  consultasHoje: ConsultaItem[];
  ultimasConsultas: ConsultaItem[];
  actividadeRecente: Array<{
    id: number;
    mensagem: string;
    paciente: string;
    data: string;
  }>;
}

// Mapeamento de status para badges com cores do design system
const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  agendada:  { bg: 'bg-[#fef8ec]', text: 'text-[#b87a00]', dot: 'bg-[#b87a00]' },
  realizada: { bg: 'bg-[#edf7f2]', text: 'text-[#1a7a4a]', dot: 'bg-[#1a7a4a]' },
  em_curso:  { bg: 'bg-[#e6f0fb]', text: 'text-[#1258a8]', dot: 'bg-[#1258a8]' },
  cancelada: { bg: 'bg-[#fdf0f0]', text: 'text-[#b83232]', dot: 'bg-[#b83232]' },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<DashboardData>('/dashboard/admin')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Shell><p className="p-8 text-[#a8bfcf] text-center">A carregar dashboard...</p></Shell>;
  if (!data) return <Shell><p className="p-8 text-[#a8bfcf] text-center">Erro ao carregar dados.</p></Shell>;

  const {
    totalConsultas,
    totalPacientes,
    totalMedicos,
    consultasHoje,
    actividadeRecente,
  } = data;

  const realizadasHoje = consultasHoje.filter(c => c.status === 'realizada').length;

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Dashboard</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">
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
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[#007d74] px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-[#009d92]"
            onClick={() => window.location.href = '/admin/consultations/agendar'}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-6">
        {/* Card 1 – Teal */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#007d74]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#e4f5f4] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#007d74" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#0c1a27] tracking-[-1px] leading-none mb-1">{totalConsultas}</h3>
          <p className="text-xs text-[#6b8299] font-medium">Total de Consultas</p>
          <div className="text-[11.5px] font-semibold text-[#007d74] mt-1.5">↑ +{totalConsultas} total</div>
        </div>

        {/* Card 2 – Sky */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#1258a8]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#e6f0fb] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#1258a8" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#0c1a27] tracking-[-1px] leading-none mb-1">{totalPacientes}</h3>
          <p className="text-xs text-[#6b8299] font-medium">Pacientes Registados</p>
          <div className="text-[11.5px] font-semibold text-[#1258a8] mt-1.5">↑ +{totalPacientes} registados</div>
        </div>

        {/* Card 3 – Green (success) */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#1a7a4a]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#edf7f2] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#1a7a4a" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#0c1a27] tracking-[-1px] leading-none mb-1">{totalMedicos}</h3>
          <p className="text-xs text-[#6b8299] font-medium">Médicos Activos</p>
          <div className="text-[11.5px] font-semibold text-[#1a7a4a] mt-1.5">Estável</div>
        </div>

        {/* Card 4 – Warn */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#b87a00]"></div>
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#fef8ec] mb-3.5">
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="#b87a00" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-[30px] font-bold text-[#0c1a27] tracking-[-1px] leading-none mb-1">{consultasHoje.length}</h3>
          <p className="text-xs text-[#6b8299] font-medium">Consultas Hoje</p>
          <div className="text-[11.5px] font-semibold text-[#b87a00] mt-1.5">{realizadasHoje} realizadas</div>
        </div>
      </div>

      {/* Duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda - Consultas de hoje */}
        <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6] flex-wrap">
            <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Consultas de Hoje</h3>
            <button
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#d6e0ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9]"
              onClick={() => window.location.href = '/admin/consultations'}
            >
              Ver todas
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Paciente</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Médico</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Hora</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {consultasHoje.map(c => {
                const bad = statusBadgeClasses[c.status] || { bg: 'bg-[#e8eef4]', text: 'text-[#6b8299]', dot: 'bg-[#a8bfcf]' };
                return (
                  <tr key={c.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f6fafe] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27] font-semibold">{c.pacientes?.users?.name ?? 'N/D'}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{c.medicos?.users?.name ?? 'N/D'}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">
                      {new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${bad.bg} ${bad.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${bad.dot}`}></span>
                        {c.status === 'agendada' ? 'Agendada' : c.status === 'realizada' ? 'Realizada' : c.status === 'em_curso' ? 'Em curso' : c.status === 'cancelada' ? 'Cancelada' : c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {consultasHoje.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-[#a8bfcf] py-6">Nenhuma consulta hoje.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-4">
          {/* Actividade Recente */}
          <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6]">
              <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Actividade Recente</h3>
            </div>
            <div className="p-4">
              {actividadeRecente.length > 0 ? actividadeRecente.map(a => (
                <div key={a.id} className="flex gap-3 items-start p-3 rounded-[8px] border border-[#ecf1f6] bg-white shadow-[0_1px_3px_rgba(12,26,39,.05)] mb-2 last:mb-0">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-[#1258a8]"></div>
                  <div>
                    <strong className="font-semibold text-[13.5px] text-[#0c1a27]">{a.mensagem}</strong>
                    <span className="block text-xs text-[#6b8299] mt-0.5">{new Date(a.data).toLocaleString('pt-MZ')}</span>
                  </div>
                </div>
              )) : (
                <p className="text-[13px] text-[#a8bfcf] text-center py-6">Nenhuma actividade recente.</p>
              )}
            </div>
          </div>

          {/* Acções Rápidas */}
          <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6]">
              <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Acções Rápidas</h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <button
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[#007d74] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#009d92]"
                onClick={() => window.location.href = '/admin/patients/novo'}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Novo Paciente
              </button>
              <button
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9]"
                onClick={() => window.location.href = '/admin/medics/novo'}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Novo Médico
              </button>
              <button
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9]"
                onClick={() => window.location.href = '/admin/reports'}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Ver Relatórios
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}