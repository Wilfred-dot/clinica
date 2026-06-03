'use client';

import { useEffect, useState, useCallback } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';

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

const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  agendada:  { bg: 'bg-[#fef8ec]', text: 'text-[#b87a00]', dot: 'bg-[#b87a00]' },
  realizada: { bg: 'bg-[#edf7f2]', text: 'text-[#1a7a4a]', dot: 'bg-[#1a7a4a]' },
  em_curso:  { bg: 'bg-[#e6f0fb]', text: 'text-[#1258a8]', dot: 'bg-[#1258a8]' },
  cancelada: { bg: 'bg-[#fdf0f0]', text: 'text-[#b83232]', dot: 'bg-[#b83232]' },
};

export default function AdminDashboard() {
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

  // Função utilitária estática interna para evitar re-alocações desnecessárias no render
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
  const consultasHoje = data?.consultasHoje ?? [];
  const actividadeRecente = data?.actividadeRecente ?? [];
  const realizadasHoje = consultasHoje.filter(c => c.status === 'realizada').length;

  return (
    <Shell>
      {/* Cabeçalho da página está estático para evitar Layout Shift enquanto carrega */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[#102A6B] tracking-[-0.5px]">Painel de Gestão</h1>
          <p className="text-[13px] text-[#6b8299] mt-0.5 font-medium uppercase tracking-[0.2px]">
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
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[#FF7F00] px-5 h-10 text-[13.5px] font-bold text-white transition hover:bg-[#E06F00] shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Consulta
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-12 text-center bg-white rounded-[12px] border border-[#fdf0f0]">
          <p className="text-[#b83232] font-semibold mb-3">Erro ao estabelecer ligação com o sistema da Clínica.</p>
          <button onClick={loadDashboardData} className="inline-flex items-center gap-2 rounded-[6px] bg-[#102A6B] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1a3a8b]">
            Tentar Novamente
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-[12px] border border-gray-200" />
          ))}
        </div>
      ) : (
        <>
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 mb-6">
            {/* Card 1 – Total Consultas */}
            <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#FF7F00]"></div>
              <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#fef8ec] mb-3.5">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="#FF7F00" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{totalConsultas}</h3>
              <p className="text-xs text-[#6b8299] font-semibold">Total de Consultas</p>
              <div className="text-[11.5px] font-semibold text-[#FF7F00] mt-1.5">Histórico global</div>
            </div>

            {/* Card 2 – Pacientes Registados */}
            <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#102A6B]"></div>
              <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#e6f0fb] mb-3.5">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="#102A6B" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{totalPacientes}</h3>
              <p className="text-xs text-[#6b8299] font-semibold">Pacientes Registados</p>
              <div className="text-[11.5px] font-semibold text-[#102A6B] mt-1.5">Utentes da clínica</div>
            </div>

            {/* Card 3 – Médicos Activos */}
            <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#1a7a4a]"></div>
              <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#edf7f2] mb-3.5">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="#1a7a4a" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                  <path d="M12 8V16" /><path d="M8 12H16" />
                </svg>
              </div>
              <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{totalMedicos}</h3>
              <p className="text-xs text-[#6b8299] font-semibold">Corpo Clínico</p>
              <div className="text-[11.5px] font-semibold text-[#1a7a4a] mt-1.5">Médicos activos</div>
            </div>

            {/* Card 4 – Consultas Hoje */}
            <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[12px] bg-[#b87a00]"></div>
              <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[9px] bg-[#fef8ec] mb-3.5">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="#b87a00" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-[30px] font-bold text-[#102A6B] tracking-[-1px] leading-none mb-1">{consultasHoje.length}</h3>
              <p className="text-xs text-[#6b8299] font-semibold">Consultas Hoje</p>
              <div className="text-[11.5px] font-semibold text-[#b87a00] mt-1.5">{realizadasHoje} concluídas</div>
            </div>
          </div>

          {/* Grid de Conteúdo Central */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Coluna Esquerda - Tabela de Consultas do Dia */}
            <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6] flex-wrap">
                <h3 className="text-[15px] font-bold text-[#102A6B]">Consultas do Dia</h3>
                <Link
                  href="/admin/consultations"
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#d6e0ea] bg-white px-3 py-1.5 text-xs font-bold text-[#102A6B] transition hover:bg-[#f1f5f9]"
                >
                  Ver agenda completa
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-[#f8fafc] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[12px_18px] text-left border-b border-[#ecf1f6]">Paciente</th>
                      <th className="bg-[#f8fafc] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[12px_18px] text-left border-b border-[#ecf1f6]">Médico</th>
                      <th className="bg-[#f8fafc] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[12px_18px] text-left border-b border-[#ecf1f6]">Hora</th>
                      <th className="bg-[#f8fafc] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[12px_18px] text-left border-b border-[#ecf1f6]">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasHoje.map(c => {
                      const statusKey = c.status?.toLowerCase() || 'agendada';
                      const bad = statusBadgeClasses[statusKey] || { bg: 'bg-[#e8eef4]', text: 'text-[#6b8299]', dot: 'bg-[#a8bfcf]' };
                      
                      return (
                        <tr key={c.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f8fafc] transition">
                          <td className="p-[14px_18px] text-[13.5px] text-[#102A6B] font-bold">{c.pacientes?.users?.name ?? 'N/D'}</td>
                          <td className="p-[14px_18px] text-[13.5px] text-[#6b8299] font-medium">{c.medicos?.users?.name ?? 'N/D'}</td>
                          <td className="p-[14px_18px] text-[13.5px] text-[#102A6B] font-semibold">
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
                    {consultasHoje.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-[#6b8299] py-10 font-medium">Nenhuma consulta agendada para hoje.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coluna Direita - Atividades e Ações Secundárias */}
            <div className="flex flex-col gap-6">
              
              {/* Actividade Recente */}
              <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6]">
                  <h3 className="text-[15px] font-bold text-[#102A6B]">Actividade Recente</h3>
                </div>
                <div className="p-4">
                  {actividadeRecente.length > 0 ? actividadeRecente.map(a => (
                    <div key={a.id} className="flex gap-3 items-start p-3 rounded-[8px] border border-[#ecf1f6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)] mb-2 last:mb-0 hover:border-[#d6e0ea] transition">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#FF7F00]"></div>
                      <div>
                        <strong className="font-semibold text-[13.5px] text-[#102A6B]">{a.mensagem}</strong>
                        <span className="block text-xs text-[#6b8299] mt-0.5">
                          {a.data ? new Date(a.data).toLocaleString('pt-MZ') : 'N/D'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-[13px] text-[#6b8299] text-center py-8 font-medium">Nenhuma actividade registada nas últimas horas.</p>
                  )}
                </div>
              </div>

              {/* Acções Rápidas */}
              <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6]">
                  <h3 className="text-[15px] font-bold text-[#102A6B]">Acções Rápidas</h3>
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  <Link
                    href="/admin/patients/novo"
                    className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[#FF7F00] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#E06F00] shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Registar Novo Paciente
                  </Link>
                  
                  <Link
                    href="/admin/medics/novo"
                    className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-bold text-[#102A6B] transition hover:bg-[#f8fafc] hover:border-[#102A6B]"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Adicionar Médico
                  </Link>
                  
                  <Link
                    href="/admin/reports"
                    className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-bold text-[#102A6B] transition hover:bg-[#f8fafc] hover:border-[#102A6B]"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Consultar Relatórios Estatísticos
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </Shell>
  );
}