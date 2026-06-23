'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

// ============================================================
// 1. Interfaces
// ============================================================

interface ResumoResponse {
  total_consultas: number;
  total_pacientes: number;
  total_medicos: number;
  consultas_realizadas: number;
  taxa_conclusao: string;
}

interface ConsultaPorDia {
  dia: number;
  total: number;
}

interface ConsultaPorMedico {
  nome: string;
  total_consultas: number;
}

interface DiagnosticoComum {
  diagnostico: string;
  total: number;
}

// ============================================================
// 2. Constantes
// ============================================================

const MESES = [
  { label: 'Janeiro',   value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Março',     value: '03' },
  { label: 'Abril',     value: '04' },
  { label: 'Maio',      value: '05' },
  { label: 'Junho',     value: '06' },
  { label: 'Julho',     value: '07' },
  { label: 'Agosto',    value: '08' },
  { label: 'Setembro',  value: '09' },
  { label: 'Outubro',   value: '10' },
  { label: 'Novembro',  value: '11' },
  { label: 'Dezembro',  value: '12' },
];

// ============================================================
// 3. Componente Principal
// ============================================================

export default function DashboardPage() {
  const [ano, setAno] = useState('2026');
  const [mes, setMes] = useState('05');

  const [resumo, setResumo] = useState<ResumoResponse | null>(null);
  const [porMedico, setPorMedico] = useState<ConsultaPorMedico[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoComum[]>([]);
  const [dailyData, setDailyData] = useState<ConsultaPorDia[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    setAno(now.getFullYear().toString());
    setMes((now.getMonth() + 1).toString().padStart(2, '0'));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const mesFull = `${ano}-${mes}`;
        
        const [res, med, diag, daily] = await Promise.all([
          request<ResumoResponse>(`/relatorios/resumo?mes=${mesFull}`),
          request<ConsultaPorMedico[]>(`/relatorios/consultas-por-medico?mes=${mesFull}`),
          request<DiagnosticoComum[]>(`/relatorios/diagnosticos-comuns?mes=${mesFull}`),
          request<ConsultaPorDia[]>(`/relatorios/consultas-por-dia?mes=${mesFull}`),
        ]);
        
        setResumo(res);
        setPorMedico(med ?? []);
        setDiagnosticos(diag ?? []);
        setDailyData(daily ?? []);
        
      } catch {
        setError('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mes, ano]);

  const mesLabel = MESES.find(m => m.value === mes)?.label ?? mes;

  const maxDaily = Math.max(...dailyData.map(d => d.total), 1);
  const maxMedico = Math.max(...porMedico.map(m => m.total_consultas), 1);
  const maxDiag = Math.max(...diagnosticos.map(d => d.total), 1);
  const barColor = 'var(--mmq-orange)';

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-6">
      <h2 className="text-[20px] font-bold text-[var(--ink)]">{title}</h2>
      <div className="w-12 h-1 bg-[var(--mmq-orange)] rounded-full mx-auto mt-2"></div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--mmq-orange)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-ink-3">A carregar estatísticas...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* ============================================================
          HEADER
          ============================================================ */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Dashboard</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">Visão geral e estatísticas da clínica</p>
          <p className="text-[13px] text-[var(--mmq-orange)] mt-1 font-medium">
            {mesLabel} {ano}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={mes}
            onChange={e => setMes(e.target.value)}
            className="px-3 py-2 h-10 text-sm border border-[var(--border)] rounded-lg bg-[var(--white)] text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
          >
            {MESES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={e => setAno(e.target.value)}
            className="px-3 py-2 h-10 text-sm border border-[var(--border)] rounded-lg bg-[var(--white)] text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-4 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
            onClick={() => window.print()}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* ============================================================
          VISÃO GERAL
          ============================================================ */}
      <div className="mb-10">
        <SectionHeader title="Visão Geral" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--white)] rounded-[12px] p-5 border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)]">
            <h4 className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px]">Consultas</h4>
            <p className="text-[28px] font-bold text-[var(--ink)]">{resumo?.total_consultas ?? 0}</p>
          </div>
          <div className="bg-[var(--white)] rounded-[12px] p-5 border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)]">
            <h4 className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px]">Pacientes</h4>
            <p className="text-[28px] font-bold text-[var(--ink)]">{resumo?.total_pacientes ?? 0}</p>
          </div>
          <div className="bg-[var(--white)] rounded-[12px] p-5 border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)]">
            <h4 className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px]">Médicos</h4>
            <p className="text-[28px] font-bold text-[var(--ink)]">{resumo?.total_medicos ?? 0}</p>
          </div>
          <div className="bg-[var(--white)] rounded-[12px] p-5 border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)]">
            <h4 className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px]">Taxa Conclusão</h4>
            <p className="text-[28px] font-bold text-[var(--mmq-orange)]">{resumo?.taxa_conclusao ?? '0%'}</p>
          </div>
        </div>
      </div>

      {/* ============================================================
          CONSULTAS POR DIA
          ============================================================ */}
      <div className="mb-10">
        <SectionHeader title="Consultas por Dia" />
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6">
          {dailyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
              <p className="text-sm text-ink-3 font-medium">Sem dados para este mês</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-[4px] h-48 px-1">
                {dailyData.map((d) => (
                  <div
                    key={d.dia}
                    className="flex-1 rounded-t-[4px] transition-all duration-300 hover:opacity-80 hover:scale-y-105 origin-bottom"
                    style={{
                      height: `${Math.max((d.total / maxDaily) * 100, 4)}%`,
                      backgroundColor: barColor,
                    }}
                    title={`Dia ${d.dia}: ${d.total} consulta(s)`}
                  />
                ))}
              </div>
              <div className="flex gap-[4px] px-1 mt-2">
                {dailyData.map((d) => (
                  <span key={d.dia} className={`flex-1 text-center text-[9px] text-ink-4 ${d.dia % 5 !== 0 ? 'opacity-0' : ''}`}>
                    {d.dia}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================
          CONSULTAS POR MÉDICO
          ============================================================ */}
      <div className="mb-10">
        <SectionHeader title="Consultas por Médico" />
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6">
          {porMedico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
              <p className="text-sm text-ink-3 font-medium">Sem dados para este mês</p>
            </div>
          ) : (
            porMedico.map((item) => (
              <div key={item.nome} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">{item.nome}</span>
                  <strong className="text-[var(--ink)]">{item.total_consultas}</strong>
                </div>
                <div className="w-full h-2 bg-[var(--border2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(item.total_consultas / maxMedico) * 100}%`, backgroundColor: barColor }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================================================
          DIAGNÓSTICOS MAIS COMUNS
          ============================================================ */}
      <div>
        <SectionHeader title="Diagnósticos mais Comuns" />
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6">
          {diagnosticos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
              <p className="text-sm text-ink-3 font-medium">Sem dados para este mês</p>
            </div>
          ) : (
            diagnosticos.map((item) => (
              <div key={item.diagnostico} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">{item.diagnostico}</span>
                  <strong className="text-[var(--ink)]">{item.total}%</strong>
                </div>
                <div className="w-full h-2 bg-[var(--border2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(item.total / maxDiag) * 100}%`, backgroundColor: barColor }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}